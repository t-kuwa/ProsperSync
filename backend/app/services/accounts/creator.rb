module Accounts
  class Creator
    class PersonalAccountCreationError < StandardError; end

    def self.call(owner:, params:)
      new(owner:, params:).call
    end

    def initialize(owner:, params:)
      @owner = owner
      @params = params
    end

    def call
      raise PersonalAccountCreationError, "個人用ワークスペースは自動で作成されます。" if account_type == :personal

      ActiveRecord::Base.transaction do
        account = Account.create!(
          owner: owner,
          name: params.fetch(:name),
          description: params[:description],
          account_type: account_type,
        )

        Membership.create!(
          account: account,
          user: owner,
          role: :owner,
        )

        account
      end
    end

    private

    attr_reader :owner, :params

    def account_type
      @account_type ||= begin
        type = params[:account_type]&.to_sym
        Account.account_types.key?(type&.to_s) ? type : :team
      end
    end
  end
end
