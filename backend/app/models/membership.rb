# ==============================================
# アカウントとユーザーの関連を管理するモデル
# ==============================================
class Membership < ApplicationRecord
  belongs_to :account, inverse_of: :memberships
  belongs_to :user, inverse_of: :memberships
  belongs_to :invited_by, class_name: "User", optional: true

  enum :role, { owner: 0, member: 1 }

  validates :role, presence: true
  validates :user_id, uniqueness: { scope: :account_id }

  before_validation :set_default_role, on: :create
  before_validation :set_joined_at, on: :create

  private

  def set_default_role
    self.role ||= :member
  end

  def set_joined_at
    self.joined_at ||= Time.current
  end
end
