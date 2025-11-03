module Api
  module V1
    class MembersController < BaseController
      before_action :set_account
      before_action :set_membership, only: %i[update destroy]

      def index
        authorize @account, :show?

        memberships = @account.memberships.includes(:user)
        render json: memberships.as_json(include: { user: { only: %i[id name email] } }), status: :ok
      end

      def create
        membership = @account.memberships.new(membership_params.merge(invited_by: current_user))
        authorize membership

        if membership.save
          render json: membership, status: :created
        else
          render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        authorize @membership

        if @membership.update(role: membership_params[:role])
          render json: @membership, status: :ok
        else
          render json: { errors: @membership.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        authorize @membership

        if @membership.destroy
          head :no_content
        else
          render json: { errors: @membership.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def set_membership
        @membership = @account.memberships.find(params[:id])
      end

      def membership_params
        params.require(:member).permit(:user_id, :role)
      end
    end
  end
end
