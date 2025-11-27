module Invoices
  class Issuer
    class Error < StandardError; end

    def self.call(invoice:)
      new(invoice:).call
    end

    def initialize(invoice:)
      @invoice = invoice
    end

    def call
      raise Error, "下書きのみ発行できます" unless invoice.draft?

      invoice.update!(
        status: :issued,
        issue_date: invoice.issue_date || Time.zone.today,
      )

      invoice
    end

    private

    attr_reader :invoice
  end
end
