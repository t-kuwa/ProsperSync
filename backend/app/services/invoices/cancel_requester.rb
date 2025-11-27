module Invoices
  class CancelRequester
    class Error < StandardError; end

    def self.call(invoice:, requested_by:, reason: nil)
      new(invoice:, requested_by:, reason:).call
    end

    def initialize(invoice:, requested_by:, reason:)
      @invoice = invoice
      @requested_by = requested_by
      @reason = reason
    end

    def call
      raise Error, "発行済みの請求書のみキャンセル申請できます" unless invoice.issued?

      ActiveRecord::Base.transaction do
        invoice.update!(status: :cancel_pending)
        InvoiceCancelRequest.create!(
          invoice:,
          requested_by:,
          reason:,
          status: :pending,
        )
      end
    end

    private

    attr_reader :invoice, :requested_by, :reason
  end
end
