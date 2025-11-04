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
          render json: { errors: membership.errors.full_messages }, status: :unprocessable_content
        end
      end

      def update
        authorize @membership

        if demoting_last_owner?(membership_params[:role])
          return render json: { errors: ["オーナーは最低1名必要です。"] }, status: :unprocessable_content
        end

        if @membership.update(role: membership_params[:role])
          render json: @membership, status: :ok
        else
          render json: { errors: @membership.errors.full_messages }, status: :unprocessable_content
        end
      end

      def destroy
        authorize @membership

        if @membership.destroy
          head :no_content
        else
          render json: { errors: @membership.errors.full_messages }, status: :unprocessable_content
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

      def demoting_last_owner?(new_role)
        return false if new_role.blank?
        return false unless @membership.owner?
        return false if new_role.to_s == "owner"

        !@account.memberships.where(role: Membership.roles[:owner]).where.not(id: @membership.id).exists?
      end
    end
  end
end
