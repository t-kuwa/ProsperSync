module Budgets
  class ProgressCalculator
    def self.call(account:, budgets:, date: Time.zone.today)
      new(account:, budgets:, date:).call
    end

    def initialize(account:, budgets:, date:)
      @account = account
      @budgets = Array(budgets)
      @date = date
    end

    def call
      return [] if budgets.empty?

      totals = Budgets::ProgressQuery.new(account:, budgets:, date:).call

      budgets.map do |budget|
        spent = totals.fetch(budget.id, 0)
        percentage = if budget.amount.positive?
                        ((spent.to_f / budget.amount) * 100).round(1)
                      else
                        0
                      end

        {
          budget:,
          current_spent: spent,
          remaining: [budget.amount - spent, 0].max,
          percentage: percentage.clamp(0, 999.9),
        }
      end
    end

    private

    attr_reader :account, :budgets, :date
  end
end
