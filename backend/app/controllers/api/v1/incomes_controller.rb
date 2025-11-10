module Api
  module V1
    class IncomesController < BaseController
      before_action :set_account
      before_action :set_income, only: %i[show update destroy]

      def index
        authorize sample_income

        @incomes = policy_scope(@account.incomes.includes(:category, :user))
                   .order(received_on: :desc, created_at: :desc)
        @incomes = apply_filters(@incomes)

        return if performed?

        render json: @incomes.map { |income| serialize_income(income) }
      end

      def show
        authorize @income
        render json: serialize_income(@income)
      end

      def create
        params_hash = income_params
        return if performed?

        @income = @account.incomes.new(params_hash)
        @income.user = current_user
        authorize @income

        if @income.save
          render json: serialize_income(@income), status: :created
        else
          render json: { errors: @income.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        authorize @income

        params_hash = income_params
        return if performed?

        if @income.update(params_hash)
          render json: serialize_income(@income)
        else
          render json: { errors: @income.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        authorize @income

        if @income.destroy
          head :no_content
        else
          render json: { errors: @income.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def set_income
        @income = @account.incomes.includes(:category, :user).find(params[:id])
      end

      def sample_income
        @sample_income ||= @account.incomes.build(user: current_user)
      end

      def income_params
        permitted = params.require(:income).permit(:title, :amount, :received_on, :memo, :category_id)

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

          scoped = scoped.where(received_on: range)
        else
          if params[:start_date].present?
            start_date = parse_date(params[:start_date])
            return scope.none unless start_date

            scoped = scoped.where("received_on >= ?", start_date)
          end

          if params[:end_date].present?
            end_date = parse_date(params[:end_date])
            return scope.none unless end_date

            scoped = scoped.where("received_on <= ?", end_date)
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

      def serialize_income(income)
        {
          id: income.id,
          account_id: income.account_id,
          user_id: income.user_id,
          category_id: income.category_id,
          title: income.title,
          amount: income.amount,
          received_on: income.received_on,
          memo: income.memo,
          created_at: income.created_at,
          updated_at: income.updated_at,
          category: serialize_category(income.category),
          user: serialize_user(income.user)
        }
      end
    end
  end
end
