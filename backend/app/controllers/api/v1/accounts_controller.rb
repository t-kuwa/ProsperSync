module Api
  module V1
    class AccountsController < BaseController
      before_action :set_account, only: %i[show update destroy]

      def index
        accounts = policy_scope(Account)
        render json: accounts.as_json(include: %i[owner]), status: :ok
      end

      def show
        authorize @account
        render json: @account.as_json(include: [:owner]), status: :ok
      end

      def create
        authorize Account

        account = Accounts::Creator.call(
          owner: current_user,
          params: account_params,
        )

        render json: account, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: e.record.errors.full_messages }, status: :unprocessable_entity
      rescue Accounts::Creator::PersonalAccountCreationError => e
        render json: { errors: [e.message] }, status: :unprocessable_entity
      end

      def update
        authorize @account

        if @account.update(account_params.slice(:name, :description))
          render json: @account, status: :ok
        else
          render json: { errors: @account.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        authorize @account

        if @account.destroy
          head :no_content
        else
          render json: { errors: @account.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_account
        @account = Account.find(params[:id])
      end

      def account_params
        params.require(:account).permit(:name, :description, :account_type)
      end
    end
  end
end
