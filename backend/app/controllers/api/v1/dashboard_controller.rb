module Api
  module V1
    class DashboardController < BaseController
      before_action :set_account

      def stats
        authorize @account, :show?

        render json: build_stats_payload
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def today
        @today ||= Time.zone.today
      end

      def current_month_range
        today.beginning_of_month..today.end_of_month
      end

      def previous_month_range
        prev = (today - 1.month).beginning_of_month
        prev..prev.end_of_month
      end

      def monthly_breakdown(months: 6)
        months_array = (0...months).map { |offset| today.beginning_of_month - offset.months }.reverse
        months_array.map do |month_start|
          range = month_start..month_start.end_of_month
          {
            month: month_start.strftime("%Y-%m"),
            label: month_start.strftime("%Y/%m"),
            income: sum_incomes(range),
            expense: sum_expenses(range),
          }
        end
      end

      def calendar_entries
        income_by_day = @account.incomes
                                .where(received_on: current_month_range)
                                .group(:received_on)
                                .sum(:amount)

        expense_by_day = @account.expenses
                                 .where(spent_on: current_month_range)
                                 .group(:spent_on)
                                 .sum(:amount)

        current_month_range.map do |date|
          {
            date: date.to_s,
            income: income_by_day[date] || 0,
            expense: expense_by_day[date] || 0,
          }
        end
      end

      def recent_transactions(limit: 6)
        expenses = @account.expenses.includes(:category).order(spent_on: :desc, created_at: :desc).limit(limit * 2)
        incomes = @account.incomes.includes(:category).order(received_on: :desc, created_at: :desc).limit(limit * 2)

        combined = expenses.map { |expense| serialize_transaction(expense, "expense", expense.spent_on) } +
                   incomes.map { |income| serialize_transaction(income, "income", income.received_on) }

        combined.sort_by { |item| [item[:date], item[:created_at]] }.reverse.first(limit).map do |item|
          item.except(:created_at)
        end
      end

      def balance_payload
        total_income = @account.incomes.sum(:amount)
        total_expense = @account.expenses.sum(:amount)

        {
          total_income:,
          total_expense:,
          net: total_income - total_expense,
        }
      end

      def build_stats_payload
        {
          account: {
            id: @account.id,
            name: @account.name,
          },
          current_month: {
            income: sum_incomes(current_month_range),
            expense: sum_expenses(current_month_range),
          },
          previous_month: {
            income: sum_incomes(previous_month_range),
            expense: sum_expenses(previous_month_range),
          },
          monthly_breakdown: monthly_breakdown,
          recent_transactions: recent_transactions,
          calendar_entries: calendar_entries,
          balance: balance_payload,
          budget_summary: budget_summary_payload,
        }
      end

      def budget_summary_payload
        decorated = decorated_budgets_for_current_month

        return default_budget_summary if decorated.empty?

        total_budget = decorated.sum { |entry| entry[:budget].amount }
        total_spent = decorated.sum { |entry| entry[:current_spent] }
        overruns = decorated.count { |entry| entry[:current_spent] > entry[:budget].amount }
        top_budgets = decorated.sort_by { |entry| -entry[:percentage].to_f }.first(3)

        {
          total_budget:,
          total_spent:,
          overruns:,
          top_budgets: BudgetSerializer.collection(top_budgets),
        }
      end

      def decorated_budgets_for_current_month
        budgets = policy_scope(@account.budgets.includes(:category))
        return [] unless budgets.exists?

        relevant_budgets = budgets.where(period_year: today.year)
                                   .where(
                                     Budget.arel_table[:period_type].eq(Budget.period_types[:yearly])
                                     .or(Budget.arel_table[:period_month].eq(today.month)),
                                   )

        return [] unless relevant_budgets.exists?

        Budgets::ProgressCalculator.call(
          account: @account,
          budgets: relevant_budgets.ordered,
          date: today,
        )
      end

      def default_budget_summary
        {
          total_budget: 0,
          total_spent: 0,
          overruns: 0,
          top_budgets: [],
        }
      end

      def sum_incomes(range)
        @account.incomes.where(received_on: range).sum(:amount)
      end

      def sum_expenses(range)
        @account.expenses.where(spent_on: range).sum(:amount)
      end

      def serialize_transaction(record, type, date_value)
        {
          id: record.id,
          resource_type: type,
          title: record.title,
          amount: record.amount,
          date: date_value.to_s,
          memo: record.memo,
          category: serialize_category(record.category),
          created_at: record.created_at,
        }
      end
    end
  end
end
