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
        handle_repeat_children
      end

      Budgets::ProgressCalculator.call(
        account:,
        budgets: [budget],
      ).first
    end

    private

    attr_reader :budget, :account, :params

    def handle_repeat_children
      return unless budget.repeat_enabled? && budget.repeat_until_date.present?

      budget.child_budgets.find_each do |child|
        period = Budgets::Period.new(
          period_type: child.period_type,
          year: child.period_year,
          month: child.period_month,
        )

        child.destroy! if period.range.end > budget.repeat_until_date
      end

      Budgets::RepeatGenerator.call(parent_budget: budget)
    end
  end
end
