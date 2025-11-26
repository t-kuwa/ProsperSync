require "set"

module FixedRecurringEntries
  class Synchronizer
    def self.call(entry:)
      new(entry:).call
    end

    def initialize(entry:, months_ahead: Config.generation_months_ahead, today: Time.zone.today)
      @entry = entry
      @months_ahead = months_ahead
      @today = today
    end

    def call
      ActiveRecord::Base.transaction do
        target_months = build_target_months
        prune_outside_range(target_months)
        upsert_occurrences(target_months)
      end
    end

    private

    attr_reader :entry, :months_ahead, :today

    def build_target_months
      start_month = entry.effective_from
      raise ArgumentError, "effective_from is required" unless start_month

      computed_end = today.beginning_of_month.advance(months: months_ahead)
      end_month = entry.effective_to || [computed_end, start_month].max

      months = []
      current = start_month
      while current <= end_month
        months << current
        current = current.next_month
      end
      months
    end

    def prune_outside_range(target_months)
      entry.occurrences.where.not(period_month: target_months).find_each do |occurrence|
        if occurrence.applied?
          occurrence.update!(status: :canceled)
        else
          occurrence.destroy!
        end
      end
    end

    def upsert_occurrences(target_months)
      target_months.each do |month|
        occurrence = entry.occurrences.find_or_initialize_by(period_month: month)
        occurrence.occurs_on = occurs_on_for(month)
        occurrence.status ||= :scheduled
        occurrence.save! if occurrence.changed?
      end
    end

    def occurs_on_for(month_date)
      last_day = month_date.end_of_month
      target_day = entry.day_of_month
      if entry.use_end_of_month? && target_day > last_day.day
        target_day = last_day.day
      end

      Date.new(month_date.year, month_date.month, [target_day, last_day.day].min)
    end
  end
end
