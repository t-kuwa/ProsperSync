class BudgetPolicy < ApplicationPolicy
  def index?
    member_of_account?
  end

  def show?
    member_of_account?
  end

  def create?
    member_of_account?
  end

  def update?
    member_of_account?
  end

  def destroy?
    member_of_account?
  end

  def current?
    member_of_account?
  end

  class Scope < Scope
    def resolve
      return scope.none unless user

      scope.joins(account: :memberships)
           .where(memberships: { user_id: user.id })
           .distinct
    end
  end

  private

  def member_of_account?
    return false unless user && account

    account.memberships.where(user_id: user.id).exists?
  end

  def account
    if record.is_a?(Budget)
      record.account
    elsif record.respond_to?(:account)
      record.account
    else
      nil
    end
  end
end
