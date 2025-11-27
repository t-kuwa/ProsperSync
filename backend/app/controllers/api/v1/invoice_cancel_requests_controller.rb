module Api
  module V1
    class InvoiceCancelRequestsController < BaseController
      before_action :set_account
      before_action :set_invoice
      before_action :set_cancel_request, only: %i[approve reject]

      def create
        authorize InvoiceCancelRequest.new(invoice: @invoice, requested_by: current_user)
        request_record = Invoices::CancelRequester.call(
          invoice: @invoice,
          requested_by: current_user,
          reason: cancel_request_params[:reason],
        )

        render json: serialize_cancel_request(request_record), status: :created
      rescue StandardError => e
        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      def approve
        authorize @cancel_request, :approve?
        Invoices::CancelResolver.call(cancel_request: @cancel_request, resolver: current_user, approve: true)
        render json: serialize_cancel_request(@cancel_request.reload)
      rescue StandardError => e
        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      def reject
        authorize @cancel_request, :reject?
        Invoices::CancelResolver.call(cancel_request: @cancel_request, resolver: current_user, approve: false)
        render json: serialize_cancel_request(@cancel_request.reload)
      rescue StandardError => e
        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def set_invoice
        @invoice = Invoice.find(params[:invoice_id])
      end

      def set_cancel_request
        @cancel_request = @invoice.invoice_cancel_requests.find(params[:id])
      end

      def cancel_request_params
        params.require(:cancel_request).permit(:reason)
      end
    end
  end
end
