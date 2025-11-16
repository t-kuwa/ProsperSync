module Budgets
  class Period
    attr_reader :type, :year, :month

    def initialize(period_type:, year:, month: nil)
      @type = period_type.to_sym
      @year = year
      @month = month
    end

    def range
      case type
      when :monthly
        raise ArgumentError, "month is required for monthly period" unless month

        Date.new(year, month, 1).all_month
      when :yearly
        Date.new(year, 1, 1).all_year
      else
        raise ArgumentError, "Unknown period_type: #{type}"
      end
    end

    def label
      monthly? ? format("%04d-%02d", year, month) : year.to_s
    end

    def monthly?
      type == :monthly
    end

    def yearly?
      type == :yearly
    end
  end
end
