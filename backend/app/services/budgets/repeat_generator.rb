module Budgets
  class RepeatGenerator
    def self.call(parent_budget:)
      new(parent_budget:).call
    end

    def initialize(parent_budget:)
      @parent_budget = parent_budget
      @account = parent_budget.account
    end

    def call
      return [] unless repeatable?

      generated = []
      periods_to_generate.each do |period_info|
        next if budget_exists_for?(period_info)

        generated << account.budgets.create!(attributes_for_period(period_info))
      end
      generated
    end

    private

    attr_reader :parent_budget, :account

    def repeatable?
      parent_budget.repeat_enabled? && parent_budget.repeat_until_date.present?
    end

    def periods_to_generate
      return [] unless repeatable?

      periods = []
      current_start = period_start(parent_budget.period_year, parent_budget.period_month)

      loop do
        current_start = advance_period(current_start)
        break unless current_start && current_start <= parent_budget.repeat_until_date

        periods << period_payload(current_start)
      end

      periods
    end

    def attributes_for_period(period_info)
      {
        category_id: parent_budget.category_id,
        amount: parent_budget.amount,
        period_type: parent_budget.period_type,
        period_year: period_info[:year],
        period_month: period_info[:month],
        name: parent_budget.name,
        repeat_enabled: false,
        repeat_until_date: nil,
        parent_budget_id: parent_budget.id,
      }
    end

    def budget_exists_for?(period_info)
      parent_budget.child_budgets.where(
        period_type: parent_budget.period_type,
        period_year: period_info[:year],
        period_month: period_info[:month],
      ).exists?
    end

    def period_start(year, month)
      if monthly?
        raise ArgumentError, "period_month is required for monthly budgets" unless month

        Date.new(year, month, 1)
      else
        Date.new(year, 1, 1)
      end
    end

    def advance_period(start_date)
      monthly? ? (start_date >> 1) : Date.new(start_date.year + 1, 1, 1)
    end

    def period_payload(start_date)
      if monthly?
        { year: start_date.year, month: start_date.month }
      else
        { year: start_date.year, month: nil }
      end
    end

    def monthly?
      parent_budget.period_type == "monthly"
    end
  end
end
