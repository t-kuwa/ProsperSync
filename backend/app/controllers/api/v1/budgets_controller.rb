module Api
  module V1
    class BudgetsController < BaseController
      before_action :set_account
      before_action :set_budget, only: %i[show update destroy]

      def index
        authorize sample_budget

        date = current_period_date
        return if performed? || date.nil?

        budgets = policy_scope(@account.budgets.includes(:category)).ordered
        decorated = Budgets::ProgressCalculator.call(
          account: @account,
          budgets: budgets,
          date:,
        )

        render json: BudgetSerializer.collection(decorated)
      end

      def show
        authorize @budget

        date = current_period_date
        return if performed? || date.nil?

        decorated = Budgets::ProgressCalculator.call(
          account: @account,
          budgets: [@budget],
          date:,
        ).first

        render json: BudgetSerializer.new(@budget, progress: decorated).as_json
      end

      def create
        authorize sample_budget

        params_hash = budget_params
        return if performed?

        decorated = Budgets::Creator.call(account: @account, params: params_hash)

        render json: BudgetSerializer.new(decorated[:budget], progress: decorated).as_json,
               status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
      end

      def update
        authorize @budget

        params_hash = budget_params
        return if performed?

        decorated = Budgets::Updater.call(budget: @budget, params: params_hash)

        render json: BudgetSerializer.new(decorated[:budget], progress: decorated).as_json
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_content
      end

      def destroy
        authorize @budget

        Budgets::Destroyer.call(budget: @budget)
        head :no_content
      end

      def current
        authorize sample_budget

        date = current_period_date
        return if performed? || date.nil?

        scope = policy_scope(@account.budgets.includes(:category))
        budgets = scope.where(period_year: date.year)
                        .where(
                          Budget.arel_table[:period_type].eq(Budget.period_types[:yearly])
                          .or(Budget.arel_table[:period_month].eq(date.month)),
                        )
                        .ordered

        decorated = Budgets::ProgressCalculator.call(
          account: @account,
          budgets: budgets,
          date:,
        )

        render json: BudgetSerializer.collection(decorated)
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def set_budget
        @budget = @account.budgets.includes(:category).find(params[:id])
      end

      def sample_budget
        @sample_budget ||= @account.budgets.build
      end

      def budget_params
        permitted = params.require(:budget).permit(
          :category_id,
          :amount,
          :period_type,
          :period_year,
          :period_month,
          :name,
        )

        if permitted[:category_id].present?
          category = @account.categories.find_by(id: permitted[:category_id])
          unless category
            render json: { errors: ["指定されたカテゴリが見つかりません。"] },
                   status: :unprocessable_content
            return {}
          end
          permitted[:category_id] = category.id
        end

        permitted[:amount] = permitted[:amount].to_i if permitted[:amount]
        permitted[:period_year] = permitted[:period_year].to_i if permitted[:period_year]
        if permitted.key?(:period_month)
          permitted[:period_month] = permitted[:period_month].present? ? permitted[:period_month].to_i : nil
        end

        permitted.to_h.symbolize_keys
      end

      def current_period_date
        return @current_period_date if defined?(@current_period_date)

        @current_period_date = if params[:date].present?
                                  Date.parse(params[:date])
                                else
                                  Time.zone.today
                                end
      rescue ArgumentError
        render json: { errors: ["date は YYYY-MM-DD 形式で指定してください。"] },
               status: :unprocessable_content
        @current_period_date = nil
      end
    end
  end
end
