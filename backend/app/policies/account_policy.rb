class AccountPolicy < ApplicationPolicy
  def index?
    user.present?
  end

  def show?
    member?
  end

  def create?
    user.present?
  end

  def update?
    member?
  end

  def destroy?
    owner? && !record.personal?
  end

  def manage_members?
    owner?
  end

  def invite?
    owner?
  end

  class Scope < Scope
    def resolve
      return scope.none unless user

      scope.joins(:memberships).where(memberships: { user_id: user.id }).distinct
    end
  end

  private

  def membership
    @membership ||= record.memberships.find_by(user_id: user.id)
  end

  def member?
    membership.present?
  end

  def owner?
    membership&.owner?
  end
end
