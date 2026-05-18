import PropTypes from 'prop-types';

/**
 * LiveIndicator component.
 * Renders a small pulsing dot animation (green pulse) to simulate live data updates.
 * Placed next to metric cards and chart titles to indicate real-time data.
 *
 * @param {Object} props
 * @param {boolean} [props.active=true] - Whether the live indicator is active (pulsing).
 * @param {string} [props.label='Live'] - The label text displayed next to the dot.
 * @returns {React.ReactElement}
 */
function LiveIndicator({ active, label }) {
  if (!active) {
    return null;
  }

  return (
    <span
      className="inline-flex items-center space-x-1.5"
      role="status"
      aria-label={label ? `${label} - live data` : 'Live data indicator'}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-executive-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-executive-green-500" />
      </span>
      {label && (
        <span className="text-xs font-medium text-executive-green-700">
          {label}
        </span>
      )}
    </span>
  );
}

LiveIndicator.propTypes = {
  active: PropTypes.bool,
  label: PropTypes.string,
};

LiveIndicator.defaultProps = {
  active: true,
  label: 'Live',
};

export default LiveIndicator;