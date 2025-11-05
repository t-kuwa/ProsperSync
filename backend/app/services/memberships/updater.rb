module Memberships
  class Updater
    class LastOwnerError < StandardError; end

    def self.call(membership:, new_role:)
      new(membership: membership, new_role: new_role).call
    end

    def initialize(membership:, new_role:)
      @membership = membership
      @new_role = new_role
      @account = membership.account
    end

    def call
      raise LastOwnerError, "オーナーは最低1名必要です。" if demoting_last_owner?

      @membership.update!(role: @new_role)
    end

    private

    def demoting_last_owner?
      return false if @new_role.blank?
      return false unless @membership.owner?
      return false if @new_role.to_s == "owner"

      !@account.memberships.where(role: Membership.roles[:owner]).where.not(id: @membership.id).exists?
    end
  end
end
