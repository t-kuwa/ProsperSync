module Api
  module V1
    class AccountInvitationsController < BaseController
      before_action :set_account

      def index
        authorize @account, :view_invitations?
        invitations = @account.account_invitations.order(created_at: :desc)
        render json: invitations, status: :ok
      end

      def create
        invitation = @account.account_invitations.new(invitation_params.merge(inviter: current_user))
        authorize invitation

        if invitation.save
          render json: invitation, status: :created
        else
          render json: { errors: invitation.errors.full_messages }, status: :unprocessable_content
        end
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def invitation_params
        params.require(:invitation).permit(:email, :role)
      end


    end
  end
end
