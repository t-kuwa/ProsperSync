module Budgets
  class Creator
    def self.call(account:, params:)
      new(account:, params:).call
    end

    def initialize(account:, params:)
      @account = account
      @params = params
    end

    def call
      form = Budgets::Form.new(account:, **params)
      raise ActiveRecord::RecordInvalid.new(form) unless form.valid?

      budget = nil
      ActiveRecord::Base.transaction do
        budget = account.budgets.create!(form.attributes_for_record)
      end

      Budgets::ProgressCalculator.call(
        account:,
        budgets: [budget],
      ).first
    end

    private

    attr_reader :account, :params
  end
end
