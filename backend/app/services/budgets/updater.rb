module Budgets
  class Updater
    def self.call(budget:, params:)
      new(budget:, params:).call
    end

    def initialize(budget:, params:)
      @budget = budget
      @account = budget.account
      @params = params
    end

    def call
      form = Budgets::Form.new(account:, **params)
      raise ActiveRecord::RecordInvalid.new(form) unless form.valid?

      ActiveRecord::Base.transaction do
        budget.update!(form.attributes_for_record)
      end

      Budgets::ProgressCalculator.call(
        account:,
        budgets: [budget],
      ).first
    end

    private

    attr_reader :budget, :account, :params
  end
end
