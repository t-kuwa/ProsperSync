class InvoicePolicy < ApplicationPolicy
  def index?
    member_of_either_account?
  end

  def show?
    member_of_either_account?
  end

  def create?
    member_of_issuer?
  end

  def issue?
    member_of_issuer?
  end

  def destroy?
    member_of_issuer?
  end

  class Scope < Scope
    def resolve
      return scope.none unless user

      scope.joins("LEFT JOIN accounts issuer ON issuer.id = invoices.issuer_account_id")
           .joins("LEFT JOIN accounts payer ON payer.id = invoices.payer_account_id")
           .joins("LEFT JOIN memberships issuer_memberships ON issuer_memberships.account_id = issuer.id")
           .joins("LEFT JOIN memberships payer_memberships ON payer_memberships.account_id = payer.id")
           .where("issuer_memberships.user_id = :user_id OR payer_memberships.user_id = :user_id", user_id: user.id)
           .distinct
    end
  end

  private

  def member_of_either_account?
    member_of_account?(record.issuer_account) || member_of_account?(record.payer_account)
  end

  def member_of_issuer?
    member_of_account?(record.issuer_account)
  end

  def member_of_account?(account)
    return false unless user && account
    account.memberships.where(user_id: user.id).exists?
  end
end
