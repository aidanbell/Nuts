import React, { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { hibernate } from '../../store/gameSlice';
import { formatNumber } from '../../utils/formatters';

const HibernateTab: React.FC = () => {
  const dispatch = useDispatch();
  const { nutsAllTime, goldNuts } = useSelector((state: RootState) => state.game);
  const [showConfirm, setShowConfirm] = useState(false);

  const goldNutReward = useMemo(
    () => Math.floor((nutsAllTime / Math.pow(10, 6)) * goldNuts.multi),
    [nutsAllTime, goldNuts.multi]
  );

  const handleConfirmHibernate = useCallback(() => {
    dispatch(hibernate());
    setShowConfirm(false);
  }, [dispatch]);

  return (
    <div
      className="tab-panel flex min-h-[60vh] items-center justify-center"
      id="hibernate-content"
    >
      <div className="panel w-full max-w-lg text-center">
        <h1 className="font-display text-3xl font-bold">💤 Hibernate</h1>
        <p className="mt-3 text-base">
          Take a long winter&apos;s nap and return next season with bonus Gold Nuts!
        </p>
        <p className="muted mt-2">
          Current reward:{' '}
          <strong className="text-gold">{formatNumber(goldNutReward)} ⭐ Gold Nuts</strong>
        </p>

        <button
          type="button"
          className="btn btn-warning btn-lg mt-6"
          onClick={() => setShowConfirm(true)}
        >
          💤 HIBERNATE NOW
        </button>

        {showConfirm && (
          <div className="mt-6 rounded-xl border border-amber/40 bg-amber/10 p-4 text-left">
            <h3 className="font-display text-lg font-bold">⚠️ Are you sure?</h3>
            <p className="mt-2">If you hibernate, you will receive:</p>
            <p className="my-4 text-center font-display text-3xl font-bold text-gold" id="gn-preview">
              ⭐ {formatNumber(goldNutReward)} Gold Nuts
            </p>
            <p className="text-sm font-bold text-danger">
              ⚠️ This will reset ALL your progress!
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button type="button" className="btn btn-danger btn-lg" onClick={handleConfirmHibernate}>
                ✓ Confirm Hibernate
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg"
                onClick={() => setShowConfirm(false)}
              >
                ✕ Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HibernateTab;
