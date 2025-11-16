module Budgets
  class ProgressQuery
    def initialize(account:, budgets:, date:)
      @account = account
      @budgets = Array(budgets)
      @date = date
    end

    def call
      return {} if budgets.empty?

      grouped_budgets.each_with_object({}) do |(key, budgets_for_period), acc|
        period = build_period(key)
        range = period.range

        scope = account.expenses.where(spent_on: range)
        totals_by_category = scope.group(:category_id).sum(:amount)
        total_amount = scope.sum(:amount)

        budgets_for_period.each do |budget|
          spent = if budget.category_id.present?
                    totals_by_category[budget.category_id] || 0
                  else
                    total_amount
                  end
          acc[budget.id] = spent
        end
      end
    end

    private

    attr_reader :account, :budgets, :date

    def grouped_budgets
      budgets.group_by do |budget|
        [budget.period_type, budget.period_year, budget.period_month]
      end
    end

    def build_period(key)
      type, year, month = key
      Budgets::Period.new(period_type: type, year:, month:)
    end
  end
end
