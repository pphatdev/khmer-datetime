


/**
 * Constants used throughout the Khmer calendar system
 * Ported from PPhatDev/LunarDate
 */
export class Constants {
    /** Map of lunar month names to their index values (0-13) */
    static readonly LUNAR_MONTHS: Record<string, number> = { 'មិគសិរ': 0, 'បុស្ស': 1, 'មាឃ': 2, 'ផល្គុន': 3, 'ចេត្រ': 4, 'ពិសាខ': 5, 'ជេស្ឋ': 6, 'អាសាឍ': 7, 'ស្រាពណ៍': 8, 'ភទ្របទ': 9, 'អស្សុជ': 10, 'កត្ដិក': 11, 'បឋមាសាឍ': 12, 'ទុតិយាសាឍ': 13 };

    /** Map of solar month names to their index values (0-11) */
    static readonly SOLAR_MONTHS: Record<string, number> = { 'មករា': 0, 'កុម្ភៈ': 1, 'មីនា': 2, 'មេសា': 3, 'ឧសភា': 4, 'មិថុនា': 5, 'កក្កដា': 6, 'សីហា': 7, 'កញ្ញា': 8, 'តុលា': 9, 'វិច្ឆិកា': 10, 'ធ្នូ': 11 };

    /** Array of the 12 animal years in Khmer */
    static readonly ANIMAL_YEARS = ['ជូត', 'ឆ្លូវ', 'ខាល', 'ថោះ', 'រោង', 'ម្សាញ់', 'មមី', 'មមែ', 'វក', 'រកា', 'ច', 'កុរ'];

    /** Array of the 10 era years (Sak) in Khmer */
    static readonly ERA_YEARS = ['សំរឹទ្ធិស័ក', 'ឯកស័ក', 'ទោស័ក', 'ត្រីស័ក', 'ចត្វាស័ក', 'បញ្ចស័ក', 'ឆស័ក', 'សប្តស័ក', 'អដ្ឋស័ក', 'នព្វស័ក'];

    /** Map for moon status (0 for waxing/កើត, 1 for waning/រោច) */
    static readonly MOON_STATUS: Record<string, number> = { 'កើត': 0, 'រោច': 1 };

    /** Short versions of the moon status ('ក', 'រ') */
    static readonly MOON_STATUS_SHORT = ['ក', 'រ'];

    /** Array of the 7 days of the week in Khmer */
    static readonly WEEKDAYS = ['អាទិត្យ', 'ចន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍'];

    /** Array of the short versions of the 7 days of the week in Khmer */
    static readonly WEEKDAYS_SHORT = ['អា', 'ចន', 'អ', 'ព', 'ព្រ', 'សុ', 'ស'];

    /** Array of the 12 solar months in Khmer */
    static readonly MONTHS = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'];

    /** Map of Arabic digits (0-9) to Khmer digits (០-៩) */
    static readonly KHMER_NUMBERS: Record<string, string> = { '0': '០', '1': '១', '2': '២', '3': '៣', '4': '៤', '5': '៥', '6': '៦', '7': '៧', '8': '៨', '9': '៩' };

    /** Map of Khmer digits (០-៩) to Arabic digits (0-9) */
    static readonly ARABIC_NUMBERS: Record<string, string> = { '០': '0', '១': '1', '២': '2', '៣': '3', '៤': '4', '៥': '5', '៦': '6', '៧': '7', '៨': '8', '៩': '9' };
}
