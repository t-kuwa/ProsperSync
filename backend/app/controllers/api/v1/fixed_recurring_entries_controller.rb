module Api
  module V1
    class FixedRecurringEntriesController < BaseController
      before_action :set_account
      before_action :set_entry, only: %i[show update destroy]

      def index
        authorize sample_entry
        entries = policy_scope(@account.fixed_recurring_entries.includes(:category)).ordered
        render json: entries.map { |entry| serialize_fixed_recurring_entry(entry) }
      end

      def show
        authorize @entry
        render json: serialize_fixed_recurring_entry(@entry)
      end

      def create
        params_hash = entry_params
        return if performed?

        @entry = @account.fixed_recurring_entries.new(params_hash)
        authorize @entry

        ActiveRecord::Base.transaction do
          if @entry.save
            FixedRecurringEntries::Synchronizer.call(entry: @entry)
            render json: serialize_fixed_recurring_entry(@entry), status: :created
          else
            render json: { errors: @entry.errors.full_messages }, status: :unprocessable_content
          end
        end
      end

      def update
        authorize @entry

        params_hash = entry_params
        return if performed?

        ActiveRecord::Base.transaction do
          if @entry.update(params_hash)
            FixedRecurringEntries::Synchronizer.call(entry: @entry)
            render json: serialize_fixed_recurring_entry(@entry)
          else
            render json: { errors: @entry.errors.full_messages }, status: :unprocessable_content
          end
        end
      end

      def destroy
        authorize @entry

        if @entry.destroy
          head :no_content
        else
          render json: { errors: @entry.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def set_entry
        @entry = @account.fixed_recurring_entries.includes(:category).find(params[:id])
      end

      def sample_entry
        @sample_entry ||= @account.fixed_recurring_entries.build
      end

      def entry_params
        permitted = params.require(:fixed_recurring_entry).permit(
          :title,
          :kind,
          :amount,
          :day_of_month,
          :use_end_of_month,
          :effective_from,
          :effective_to,
          :category_id,
          :memo,
        )

        permitted[:effective_to] = nil if permitted[:effective_to].blank?

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
    end
  end
end
