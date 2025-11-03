module Api
  module V1
    class InvitationsController < BaseController
      before_action :set_invitation, only: :accept

      def accept
        authorize @invitation, :accept?

        unless ActiveSupport::SecurityUtils.secure_compare(@invitation.token, params.require(:token))
          return render json: { error: "トークンが不正です。" }, status: :unauthorized
        end

        @invitation.accept!(current_user)
        render json: { message: "招待を承諾しました。" }, status: :ok
      rescue StandardError => e
        render json: { error: e.message }, status: :unprocessable_entity
      end

      private

      def set_invitation
        @invitation = AccountInvitation.find(params[:id])
      end
    end
  end
end
