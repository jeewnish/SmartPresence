/**
 * myCoursesStyles.js
 * Supplemental / exported named styles for the My Courses screen.
 * Primary styles live inline in MyCoursesScreen.js and CourseCard.js
 * for co-location, but shared tokens are here.
 */
import { StyleSheet } from 'react-native';
import colors from './colors';

export const sharedCard = StyleSheet.create({
  glassBorder: {
    borderWidth: 1,
    borderColor: colors.borderPurple,
    borderRadius: 14,
    overflow: 'hidden',
  },
  shadow: {
    shadowColor: colors.purplePrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
});

export default sharedCard;
