module Invoices
  class Creator
    class Error < StandardError; end

    def self.call(issuer_account:, params:)
      new(issuer_account:, params:).call
    end

    def initialize(issuer_account:, params:)
      @issuer_account = issuer_account
      @params = params
    end

    def call
      lines = (params.delete(:lines) || []).map { |line| line.to_h.symbolize_keys }
      raise Error, "明細は1件以上必要です" if lines.empty?

      ActiveRecord::Base.transaction do
        total = lines.sum do |line|
          line[:quantity].to_i * line[:unit_price_minor].to_i
        end

        invoice = issuer_account.issued_invoices.new(
          payer_account_id: params[:payer_account_id],
          title: params[:title],
          description: params[:description],
          currency: params[:currency] || "JPY",
          amount_minor: total,
          status: :draft,
          issue_date: params[:issue_date],
          due_date: params[:due_date],
          invoice_number: Invoices::NumberGenerator.call(issuer_account:),
          issuer_contact: params[:issuer_contact],
          payer_contact: params[:payer_contact],
          memo: params[:memo],
        )

        invoice.invoice_lines.build(lines)
        invoice.save!
        invoice
      end
    end

    private

    attr_reader :issuer_account, :params
  end
end
