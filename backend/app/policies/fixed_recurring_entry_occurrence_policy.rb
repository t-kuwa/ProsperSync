class FixedRecurringEntryOccurrencePolicy < ApplicationPolicy
  def index?
    member_of_account?
  end

  def apply?
    member_of_account?
  end

  def cancel?
    member_of_account?
  end

  class Scope < Scope
    def resolve
      return scope.none unless user

      scope.joins(fixed_recurring_entry: { account: :memberships })
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
    if record.is_a?(FixedRecurringEntryOccurrence)
      record.fixed_recurring_entry&.account
    elsif record.respond_to?(:fixed_recurring_entry) && record.fixed_recurring_entry.respond_to?(:account)
      record.fixed_recurring_entry.account
    else
      nil
    end
  end
end
