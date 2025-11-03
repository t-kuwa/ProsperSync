# ==============================================
# アカウント招待に関する認可ポリシーを管理するクラス
# ==============================================
class AccountInvitationPolicy < ApplicationPolicy
  def index?
    owner?
  end

  def create?
    owner?
  end

  def accept?
    user.present? && (owner? || email_matches_user?)
  end

  private

  def owner?
    record.account.memberships.exists?(user_id: user.id, role: Membership.roles[:owner])
  end

  def email_matches_user?
    record.email.casecmp?(user.email)
  end
end
