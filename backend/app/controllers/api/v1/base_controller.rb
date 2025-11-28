module Api
  module V1
    class BaseController < ApplicationController
      before_action :authenticate_user!

      protected

      def serialize_category(category)
        return unless category

        {
          id: category.id,
          account_id: category.account_id,
          name: category.name,
          type: category.type,
          color: category.color,
          icon: category.icon,
          position: category.position,
          created_at: category.created_at,
          updated_at: category.updated_at
        }
      end

      def serialize_user(user)
        return unless user

        {
          id: user.id,
          name: user.name,
          email: user.email
        }
      end

      def serialize_fixed_recurring_entry(entry)
        return unless entry

        {
          id: entry.id,
          account_id: entry.account_id,
          category_id: entry.category_id,
          title: entry.title,
          kind: entry.kind,
          amount: entry.amount,
          day_of_month: entry.day_of_month,
          use_end_of_month: entry.use_end_of_month,
          effective_from: entry.effective_from,
          effective_to: entry.effective_to,
          memo: entry.memo,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
          category: serialize_category(entry.category)
        }
      end

      def serialize_invoice_line(line)
        return unless line

        {
          id: line.id,
          description: line.description,
          quantity: line.quantity,
          unit_price_minor: line.unit_price_minor,
          position: line.position
        }
      end

      def serialize_invoice(invoice)
        return unless invoice

        {
          id: invoice.id,
          issuer_account_id: invoice.issuer_account_id,
          payer_account_id: invoice.payer_account_id,
          title: invoice.title,
          description: invoice.description,
          amount_minor: invoice.amount_minor,
          currency: invoice.currency,
          status: invoice.status,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          invoice_number: invoice.invoice_number,
          issuer_contact: invoice.issuer_contact,
          payer_contact: invoice.payer_contact,
          memo: invoice.memo,
          created_at: invoice.created_at,
          updated_at: invoice.updated_at,
          lines: invoice.invoice_lines.order(:position, :id).map { |line| serialize_invoice_line(line) },
          cancel_requests: invoice.invoice_cancel_requests.order(created_at: :desc).map do |req|
            serialize_cancel_request(req)
          end
        }
      end

      def serialize_cancel_request(cancel_request)
        return unless cancel_request

        {
          id: cancel_request.id,
          invoice_id: cancel_request.invoice_id,
          requested_by_id: cancel_request.requested_by_id,
          reason: cancel_request.reason,
          status: cancel_request.status,
          resolved_by_id: cancel_request.resolved_by_id,
          resolved_at: cancel_request.resolved_at,
          created_at: cancel_request.created_at,
          updated_at: cancel_request.updated_at
        }
      end
    end
  end
end
