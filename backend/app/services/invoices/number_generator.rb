module Invoices
  class NumberGenerator
    def self.call(issuer_account:)
      new(issuer_account:).call
    end

    def initialize(issuer_account:)
      @issuer_account = issuer_account
    end

    def call
      sequence = next_sequence
      format("INV-%04d", sequence)
    end

    private

    attr_reader :issuer_account

    def next_sequence
      last_number = issuer_account.issued_invoices.where.not(invoice_number: nil)
                               .order(:created_at)
                               .pluck(:invoice_number)
                               .map { |num| num[/\d+$/]&.to_i }
                               .compact
                               .max
      (last_number || 0) + 1
    end
  end
end
