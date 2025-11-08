require "securerandom"

# ==============================================
# アカウントに対する招待情報を管理するモデル
# ==============================================
class AccountInvitation < ApplicationRecord
  EMAIL_REGEX = URI::MailTo::EMAIL_REGEXP

  belongs_to :account
  belongs_to :inviter, class_name: "User"

  enum :role, { owner: 0, member: 1 }

  validates :email, presence: true, format: { with: EMAIL_REGEX }
  validates :role, presence: true
  validates :token, presence: true, uniqueness: true

  before_validation :set_defaults, on: :create
  after_create_commit :deliver_invitation_email

  def expired?
    expires_at.present? && expires_at < Time.current
  end

  def revoked?
    revoked_at.present?
  end

  def acceptable?
    !expired? && !revoked? && accepted_at.blank?
  end

  class InvitationError < StandardError; end
  class InvalidInvitationError < InvitationError; end
  class EmailMismatchError < InvitationError; end
  class AlreadyMemberError < InvitationError; end

  def accept!(invitee_user)
    raise InvalidInvitationError, "招待が無効です。" unless acceptable?
    raise EmailMismatchError, "招待されたメールアドレスと一致しません。" unless email.casecmp?(invitee_user.email)
    raise AlreadyMemberError, "すでにメンバーです。" if account.memberships.exists?(user_id: invitee_user.id)

    ActiveRecord::Base.transaction do
      Membership.create!(
        account: account,
        user: invitee_user,
        role: role,
        invited_by: inviter,
        joined_at: Time.current
      )

      update!(accepted_at: Time.current)
    end
  end

  private

  def set_defaults
    self.token ||= SecureRandom.hex(24)
    self.expires_at ||= 7.days.from_now
    self.role ||= :member
  end

  def deliver_invitation_email
    AccountInvitationMailer.with(invitation: self).invite_email.deliver_later
  end
end
