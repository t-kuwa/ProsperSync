module Api
  module V1
    class InvoicesController < BaseController
      before_action :set_account
      before_action :set_invoice, only: %i[show issue destroy]

      def index
        authorize Invoice.new(issuer_account: @account, payer_account: @account), :index?
        invoices = policy_scope(base_scope).includes(:invoice_lines)
        render json: invoices.map { |invoice| serialize_invoice(invoice) }
      end

      def show
        authorize @invoice
        render json: serialize_invoice(@invoice)
      end

      def create
        raw_lines = params.require(:invoice)[:lines]&.map { |line| line.permit(:description, :quantity, :unit_price_minor, :position).to_h.symbolize_keys } || []
        payload = invoice_params.to_h.symbolize_keys
        authorize Invoice.new(issuer_account: @account, payer_account_id: payload[:payer_account_id]), :create?

        invoice = Invoices::Creator.call(
          issuer_account: @account,
          params: payload.merge(lines: raw_lines),
        )

        render json: serialize_invoice(invoice), status: :created
      rescue ActiveRecord::RecordInvalid, Invoices::Creator::Error => e
        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      def issue
        authorize @invoice
        Invoices::Issuer.call(invoice: @invoice)
        render json: serialize_invoice(@invoice)
      rescue StandardError => e
        render json: { errors: [e.message] }, status: :unprocessable_content
      end

      def destroy
        authorize @invoice
        if @invoice.draft? && @invoice.destroy
          head :no_content
        else
          render json: { errors: ["削除できませんでした"] }, status: :unprocessable_content
        end
      end

      private

      def set_account
        @account = Account.find(params[:account_id])
      end

      def set_invoice
        @invoice = base_scope.find(params[:id])
      end

      def base_scope
        Invoice.where("issuer_account_id = :id OR payer_account_id = :id", id: @account.id)
      end

      def invoice_params
        params.require(:invoice).permit(
          :payer_account_id,
          :title,
          :description,
          :currency,
          :issue_date,
          :due_date,
          :memo,
          issuer_contact: {},
          payer_contact: {},
        )
      end
    end
  end
end
