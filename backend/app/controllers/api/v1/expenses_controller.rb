module Api
  module V1
    class ExpensesController < BaseController
      before_action :set_account
      before_action :set_expense, only: %i[show update destroy]

      def index
        authorize sample_expense

        @expenses = policy_scope(@account.expenses.includes(:category, :user))
                    .order(spent_on: :desc, created_at: :desc)
        @expenses = apply_filters(@expenses)

        return if performed?

        render json: @expenses.map { |expense| serialize_expense(expense) }
      end

      def show
        authorize @expense
        render json: serialize_expense(@expense)
      end

      def create
        params_hash = expense_params
        return if performed?

        @expense = @account.expenses.new(params_hash)
        @expense.user = current_user
        authorize @expense

        if @expense.save
          render json: serialize_expense(@expense), status: :created
        else
          render json: { errors: @expense.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        authorize @expense

        params_hash = expense_params
        return if performed?

        if @expense.update(params_hash)
          render json: serialize_expense(@expense)
        else
          render json: { errors: @expense.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        authorize @expense

        if @expense.destroy
          head :no_content
        else
          render json: { errors: @expense.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def set_expense
        @expense = @account.expenses.includes(:category, :user).find(params[:id])
      end

      def sample_expense
        @sample_expense ||= @account.expenses.build(user: current_user)
      end

      def expense_params
        permitted = params.require(:expense).permit(:title, :amount, :spent_on, :memo, :category_id)

        if permitted[:category_id].present?
          category = @account.categories.find_by(id: permitted[:category_id])
          unless category
            render json: { errors: ["指定されたカテゴリが見つかりません。"] }, status: :unprocessable_content
            return {}
          end
          permitted[:category_id] = category.id
        end

        permitted
      end

      def apply_filters(scope)
        scoped = scope

        if params[:category_id].present?
          scoped = scoped.where(category_id: params[:category_id])
        end

        if params[:month].present?
          range = month_range(params[:month])
          return scope.none unless range

          scoped = scoped.where(spent_on: range)
        else
          if params[:start_date].present?
            start_date = parse_date(params[:start_date])
            return scope.none unless start_date

            scoped = scoped.where("spent_on >= ?", start_date)
          end

          if params[:end_date].present?
            end_date = parse_date(params[:end_date])
            return scope.none unless end_date

            scoped = scoped.where("spent_on <= ?", end_date)
          end
        end

        scoped
      end

      def month_range(value)
        date = Date.strptime(value, "%Y-%m")
        date.beginning_of_month..date.end_of_month
      rescue ArgumentError
        render_invalid_filter("monthパラメータはYYYY-MM形式で指定してください。")
        nil
      end

      def parse_date(value)
        Date.parse(value)
      rescue ArgumentError
        render_invalid_filter("日付はYYYY-MM-DD形式で指定してください。")
        nil
      end

      def render_invalid_filter(message)
        render json: { errors: [message] }, status: :unprocessable_content unless performed?
      end

      def serialize_expense(expense)
        {
          id: expense.id,
          account_id: expense.account_id,
          user_id: expense.user_id,
          category_id: expense.category_id,
          title: expense.title,
          amount: expense.amount,
          spent_on: expense.spent_on,
          memo: expense.memo,
          created_at: expense.created_at,
          updated_at: expense.updated_at,
          category: serialize_category(expense.category),
          user: serialize_user(expense.user)
        }
      end
    end
  end
end
