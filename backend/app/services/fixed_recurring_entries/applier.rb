module FixedRecurringEntries
  class Applier
    class Error < StandardError; end

    def self.apply!(occurrence:, user:)
      new(occurrence:, user:).apply!
    end

    def self.cancel!(occurrence:)
      new(occurrence:, user: nil).cancel!
    end

    def initialize(occurrence:, user:)
      @occurrence = occurrence
      @user = user
    end

    def apply!
      raise Error, "occurrence is required" unless occurrence
      raise Error, "user is required" unless user
      return occurrence if occurrence.applied?

      ActiveRecord::Base.transaction do
        apply_transaction = build_transaction
        apply_transaction.save!

        occurrence.update!(
          status: :applied,
          applied_at: Time.zone.now,
          income: income_record(apply_transaction),
          expense: expense_record(apply_transaction),
        )
      end

      occurrence
    end

    def cancel!
      raise Error, "occurrence is required" unless occurrence

      ActiveRecord::Base.transaction do
        linked_expense = occurrence.expense
        linked_income = occurrence.income

        occurrence.update!(
          status: :canceled,
          applied_at: nil,
          income: nil,
          expense: nil,
        )

        linked_expense&.destroy!
        linked_income&.destroy!
      end

      occurrence
    end

    private

    attr_reader :occurrence, :user

    def entry
      occurrence.fixed_recurring_entry
    end

    def build_transaction
      if entry.income?
        build_income
      else
        build_expense
      end
    end

    def build_income
      Income.new(
        account: entry.account,
        user:,
        category: entry.category,
        title: entry.title,
        amount: entry.amount,
        memo: entry.memo,
        received_on: occurrence.occurs_on,
      )
    end

    def build_expense
      Expense.new(
        account: entry.account,
        user:,
        category: entry.category,
        title: entry.title,
        amount: entry.amount,
        memo: entry.memo,
        spent_on: occurrence.occurs_on,
      )
    end

    def income_record(transaction)
      transaction.is_a?(Income) ? transaction : nil
    end

    def expense_record(transaction)
      transaction.is_a?(Expense) ? transaction : nil
    end
  end
end
