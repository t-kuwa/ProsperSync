module Invoices
  class CancelResolver
    class Error < StandardError; end

    def self.call(cancel_request:, resolver:, approve:)
      new(cancel_request:, resolver:, approve:).call
    end

    def initialize(cancel_request:, resolver:, approve:)
      @cancel_request = cancel_request
      @resolver = resolver
      @approve = approve
    end

    def call
      raise Error, "処理済みの申請です" unless cancel_request.pending?

      ActiveRecord::Base.transaction do
        if approve
          cancel_request.invoice.update!(status: :canceled)
          cancel_request.update!(
            status: :approved,
            resolved_by: resolver,
            resolved_at: Time.zone.now,
          )
        else
          cancel_request.invoice.update!(status: :issued)
          cancel_request.update!(
            status: :rejected,
            resolved_by: resolver,
            resolved_at: Time.zone.now,
          )
        end
      end

      cancel_request
    end

    private

    attr_reader :cancel_request, :resolver, :approve
  end
end
