module Api
  module V1
    class FixedRecurringEntryOccurrencesController < BaseController
      before_action :set_account

      def index
        authorize sample_occurrence

        month = parse_month(params[:month])
        return if performed? || month.nil?

        occurrences = policy_scope(base_scope)
                      .includes(fixed_recurring_entry: :category)
                      .where(period_month: month.beginning_of_month)
                      .order(:occurs_on, :id)

        render json: occurrences.map { |occurrence| serialize_occurrence(occurrence) }
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def base_scope
        FixedRecurringEntryOccurrence.joins(:fixed_recurring_entry)
                                     .where(fixed_recurring_entries: { account_id: @account.id })
      end

      def sample_occurrence
        entry = @account.fixed_recurring_entries.build
        @sample_occurrence ||= FixedRecurringEntryOccurrence.new(fixed_recurring_entry: entry)
      end

      def parse_month(value)
        Date.strptime(value, "%Y-%m")
      rescue ArgumentError, TypeError
        render json: { errors: ["monthパラメータはYYYY-MM形式で指定してください。"] }, status: :unprocessable_content
        nil
      end

      def serialize_occurrence(occurrence)
        {
          id: occurrence.id,
          fixed_recurring_entry_id: occurrence.fixed_recurring_entry_id,
          period_month: occurrence.period_month,
          occurs_on: occurrence.occurs_on,
          status: occurrence.status,
          applied_at: occurrence.applied_at,
          created_at: occurrence.created_at,
          updated_at: occurrence.updated_at,
          fixed_recurring_entry: serialize_fixed_recurring_entry(occurrence.fixed_recurring_entry)
        }
      end
    end
  end
end
