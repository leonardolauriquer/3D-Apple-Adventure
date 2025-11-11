
import React, { useState, useEffect, useMemo } from 'react';
import { playSound } from '../../utils/audio';
import { User } from 'firebase/auth';
import { db, firebaseEnabled } from '../../config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface RankEntry {
    rank: number;
    name: string;
    level: number;
    photoURL: string;
    isPlayer: boolean;
}

interface RankingProps {
    t: (key: string, options?: any) => string;
    onClose: () => void;
    user: User;
}

export const Ranking: React.FC<RankingProps> = ({ t, onClose, user }) => {
    const [leaderboard, setLeaderboard] = useState<RankEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!firebaseEnabled || !db) {
            setIsLoading(false);
            return;
        }

        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const leaderboardCol = collection(db, 'leaderboard');
                const q = query(leaderboardCol, orderBy('highestLevel', 'desc'), limit(100));
                const querySnapshot = await getDocs(q);
                
                const data: RankEntry[] = querySnapshot.docs.map((doc, index) => ({
                    rank: index + 1,
                    name: doc.data().playerName,
                    level: doc.data().highestLevel,
                    photoURL: doc.data().photoURL,
                    isPlayer: doc.id === user.uid,
                }));

                setLeaderboard(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [user.uid]);

    const handleClose = () => {
        playSound('menuClick');
        onClose();
    };
    
    const playerRankInfo = useMemo(() => {
        return leaderboard.find(entry => entry.isPlayer);
    }, [leaderboard]);

    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="w-full max-w-2xl h-5/6 bg-gray-800 text-white rounded-xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-yellow-400">{t('ranking.title')}</h2>
                    <button onClick={handleClose} className="text-2xl font-bold text-white hover:text-red-500">&times;</button>
                </div>
                
                {playerRankInfo && (
                    <div className="p-4 bg-yellow-600 text-black font-bold text-center">
                        {t('ranking.yourRank')}: #{playerRankInfo.rank} - {t('levelLabel')} {playerRankInfo.level}
                    </div>
                )}
                
                <div className="flex-grow overflow-y-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-full">
                            <p className="text-xl animate-pulse">{t('loading')}...</p>
                        </div>
                    ) : !firebaseEnabled ? (
                         <div className="flex justify-center items-center h-full p-4 text-center">
                            <p className="text-gray-400">Online ranking is disabled. Please configure Firebase in <code>src/config/firebase.ts</code>.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-gray-900 z-10">
                                <tr>
                                    <th className="p-3 w-[15%]">{t('ranking.rank')}</th>
                                    <th className="p-3 w-[60%]">{t('ranking.name')}</th>
                                    <th className="p-3 w-[25%] text-right">{t('ranking.level')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.length > 0 ? leaderboard.map((entry) => (
                                    <tr key={entry.rank} className={`border-t border-gray-700 ${entry.isPlayer ? 'bg-yellow-500 text-black font-bold' : ''}`}>
                                        <td className="p-3 text-lg font-semibold">{entry.rank}</td>
                                        <td className="p-3 flex items-center gap-3">
                                            <img src={entry.photoURL} alt={entry.name} className="w-8 h-8 rounded-full" />
                                            <span>{entry.name}</span>
                                        </td>
                                        <td className="p-3 text-right text-lg font-semibold">{entry.level}</td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="text-center p-8 text-gray-400">No players on the leaderboard yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};
