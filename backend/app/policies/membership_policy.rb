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
    return false if record.owner? && record.user_id == user.id

    account_owner? || record.user_id == user.id
  end

  private

  def account_member?
    record.account.memberships.exists?(user_id: user.id)
  end

  def account_owner?
    record.account.memberships.exists?(user_id: user.id, role: Membership.roles[:owner])
  end
end
