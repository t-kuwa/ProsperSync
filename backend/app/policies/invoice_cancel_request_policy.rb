class InvoiceCancelRequestPolicy < ApplicationPolicy
  def create?
    member_of_issuer?
  end

  def approve?
    member_of_issuer?
  end

  def reject?
    member_of_issuer?
  end

  private

  def member_of_issuer?
    return false unless user
    account = if record.respond_to?(:invoice)
                record.invoice.issuer_account
              elsif record.is_a?(Invoice)
                record.issuer_account
              end
    return false unless account

    account.memberships.where(user_id: user.id).exists?
  end
end
