module Api
  module V1
    class CategoriesController < BaseController
      before_action :set_account
      before_action :set_category, only: %i[update destroy]

      def index
        authorize sample_category

        @categories = policy_scope(@account.categories).ordered
        if (type = normalized_type_param)
          @categories = @categories.where(type:)
        end

        render json: @categories.map { |category| serialize_category(category) }
      end

      def create
        @category = @account.categories.new(category_params)
        authorize @category

        if @category.save
          render json: serialize_category(@category), status: :created
        else
          render json: { errors: @category.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        authorize @category

        if @category.update(category_params)
          render json: serialize_category(@category)
        else
          render json: { errors: @category.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        authorize @category

        if @category.destroy
          head :no_content
        else
          render json: { errors: @category.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def set_category
        @category = @account.categories.find(params[:id])
      end

      def category_params
        params.require(:category).permit(:name, :type, :color, :icon, :position)
      end

      def sample_category
        @sample_category ||= @account.categories.build
      end

      def normalized_type_param
        type = params[:type].presence
        return unless type

        type = type.to_s
        return type if Category.types.key?(type)
      end
    end
  end
end
