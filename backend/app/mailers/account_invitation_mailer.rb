class AccountInvitationMailer < ApplicationMailer
  def invite_email
    @invitation = params[:invitation]
    @accept_url = invitation_accept_url(@invitation)

    mail(
      to: @invitation.email,
      subject: I18n.t(
        "mailers.account_invitation_mailer.invite_email.subject",
        account: @invitation.account.name,
        default: "#{@invitation.account.name}への招待",
      ),
    )
  end

  private

  def invitation_accept_url(invitation)
    "#{Rails.configuration.x.frontend_base_url}/invitations/#{invitation.id}/accept?token=#{invitation.token}"
  end
end
