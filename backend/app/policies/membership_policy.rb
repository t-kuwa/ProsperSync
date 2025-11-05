# ==============================================
# メンバーシップに関する認可ポリシーを管理するクラス
# ==============================================
class MembershipPolicy < ApplicationPolicy
  def index?
    AccountPolicy.new(user, record.account).show?
  end

  def create?
    account_owner?
  end

  def update?
    account_owner?
  end

  def destroy?
    return false unless account_member?

    # The user is trying to remove themselves
    if record.user_id == user.id
      # Prevent the last owner from leaving
      return false if record.owner? && record.account.memberships.where(role: :owner).count == 1

      return true
    end

    # An owner is trying to remove another member
    account_owner?
  end

  private

  def account_member?
    record.account.memberships.exists?(user_id: user.id)
  end

  def account_owner?
    record.account.memberships.exists?(user_id: user.id, role: Membership.roles[:owner])
  end
end
