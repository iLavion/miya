import { useEffect, useState } from 'react';
import { MaterialSymbol } from 'react-material-symbols';
import Base from '@ui/web/layouts/base';
import Slider from 'react-slick';
import styles from '@css/miya.module.css';
import api from '@api/url';

export default function AnimePage() {
    const [top, setTop] = useState([]);
    const [latest, setLatest] = useState([]);
    const [releases, setReleases] = useState([]);
    const [added, setAdded] = useState([]);
    const [completed, setCompleted] = useState([]);
    const [popular, setPopular] = useState([]);
    const [imageUrls, setImageUrls] = useState({});
    const [dateFilter, setDateFilter] = useState("day");

    useEffect(() => {
        const fetchAnimeData = async () => {
            try {
                console.log('Fetching top anime data...');
                const topAnime = await api.get('/anime/top');
                if (Array.isArray(topAnime.data)) {
                    setTop(topAnime.data);
                    console.log('Top anime data fetched:', topAnime.data);
                } else {
                    console.warn('Top anime data is not an array:', topAnime.data);
                }
    
                // Fetch anime data for latest, releases, added, and completed
                const fetchNonTopAnimeData = async () => {
                    console.log('Fetching latest anime data...');
                    const latestAnime = await api.get('/anime/latest');
                    console.log('Fetching releases anime data...');
                    const releasesAnime = await api.get('/anime/releases');
                    console.log('Fetching added anime data...');
                    const addedAnime = await api.get('/anime/added');
                    console.log('Fetching completed anime data...');
                    const completedAnime = await api.get('/anime/completed');
                    console.log('Fetching popular anime data...');
                    const popularAnime = await api.get(`/anime/popular?dateFilter=${dateFilter}`);
    
                    // Process all non-top anime (latest, releases, added, and completed)
                    const allNonTopAnime = [
                        ...latestAnime.data,
                        ...releasesAnime.data,
                        ...addedAnime.data,
                        ...completedAnime.data,
                        ...popularAnime.data.combinedData
                    ];

                    const sortedLatest = latestAnime.data.sort((a, b) => {
                        const dateA = new Date(a.additionalData?.updatedAt);
                        const dateB = new Date(b.additionalData?.updatedAt);
                        return dateB - dateA;
                    });
    
                    // Fetch image URLs for all non-top anime
                    const imagePromises = allNonTopAnime.map(async (anime) => {
                        const url = await getImageUrl(anime);
                        console.log(`Image URL for ${anime.title.romaji}:`, url);
                        return { id: anime.id, url };
                    });
    
                    const resolvedImageUrls = await Promise.all(imagePromises);
                    const imageUrlMap = resolvedImageUrls.reduce((acc, { id, url }) => {
                        acc[id] = url;
                        return acc;
                    }, {});
    
                    setImageUrls(imageUrlMap);
                    console.log('Image URLs fetched for non-top anime:', imageUrlMap);
    
                    // Set state for each anime category
                    setLatest(sortedLatest);
                    setReleases(releasesAnime.data);
                    setAdded(addedAnime.data);
                    setCompleted(completedAnime.data);
                    setPopular(popularAnime.data.combinedData)
    
                };
    
                await fetchNonTopAnimeData();
    
            } catch (error) {
                console.error('Error fetching anime data:', error);
            }
        };
    
        fetchAnimeData();
    }, [dateFilter]);
    

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        dotsClass: 'slick-dots custom-dots',
    };

    const padZero = (value) => value.toString().padStart(2, '0');
    const formatDate = (startDate) => {
        if (!startDate) return null;
        const { year, month, day } = startDate;
        if (year) {
            const formattedMonth = month ? padZero(month) : '';
            const formattedDay = day ? padZero(day) : '';
            return day ? `${year}-${formattedMonth}-${formattedDay}` : `${year}-${formattedMonth}`;
        }
        return null;
    };

    const getImageUrl = async (anime) => {
        const posterImage = anime.additionalData.posterImage;
        const coverImage = anime.additionalData.coverImage || anime.coverImage.extraLarge || anime.coverImage.large;

        const isValidImage = (imageUrl) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = imageUrl;
        
                img.onload = () => {
                    const aspectRatio = img.width / img.height;
                    const meetsQuality = img.width >= 200;
                    const isHorizontal = aspectRatio > 1.5; 
                    if (meetsQuality && !isHorizontal) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                };
                img.onerror = () => resolve(false);
            });
        };

        const [isPosterValid, isCoverValid] = await Promise.all([
            isValidImage(posterImage),
            isValidImage(coverImage)
        ]);

        if (isPosterValid) return posterImage;
        if (isCoverValid) return coverImage;
        return anime.coverImage.extraLarge;
    };

    const renderTopCard = (anime) => {
        const formattedDate = formatDate(anime.startDate);
        return (
            <div className={styles.myAnimeTopContainer}>
                <div className={styles.myAnimeTopCard} />
                <div className={styles.myAnimeTopInfoCard}>
                    <h3 className={styles.myAnimeTopTitle}>{anime.title.romaji || anime.title.english}</h3>
                    {anime.additionalData?.titles?.ja_jp && <span className={styles.myAnimeTopAltTitle}>{anime.additionalData.titles.ja_jp}</span>}
                    {formattedDate && <p className={styles.animeReleaseDate}>{formattedDate}</p>}
                    <p className={styles.myAnimeTopDescription}>{anime.additionalData?.synopsis}</p>
                    <a href="#" className={styles.myAnimeTopPlayButtonContainer}>
                        <div className={styles.myAnimeTopPlayButton}>
                            <MaterialSymbol icon="play_arrow" size={24} fill color="#fff" />
                            <div style={{ paddingBottom: '3px' }}>PLAY NOW</div>
                        </div>
                    </a>
                </div>
                <div className={styles.myAnimeTopImageWrapper}>
                    <img src={anime.additionalData?.coverImage || anime.coverImage?.extraLarge} alt={anime.title.romaji} className={styles.myAnimeTopImage} />
                </div>
            </div>
        );
    };

    const renderAnimeList = (animeList, title) => {
        return (
            <div className={styles.myAnimeCategoryContainer}>
                <div className={styles.myAnimeCategoryBar}>
                    <span className={styles.myAnimeCardTitle}>
                        {title}
                    </span>
                    <div className={styles.myAnimeCategorySettings}>

                    </div>
                </div>
                <div className={styles.myAnimeOtherContainer}>
                    {animeList.map((anime) => (
                        <div key={anime.id} className={styles.myAnimeCard}>
                            <div className={styles.myAnimeCardImageContainer}>
                                <img src={imageUrls[anime.id]} alt={anime.title.romaji} className={styles.myAnimeCardImage} />
                            </div>
                            <div className={styles.myAnimeCardTitleContainer}>
                                <span className={styles.myAnimeCardTitle}>
                                    {anime.title.romaji || anime.title.english}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderAnimeLatestList = (total = 12) => {
        const displayedAnime = latest.slice(0, total);
        return (
            <div className={styles.myAnimeCategoryContainer}>
                <div className={styles.myAnimeCategoryBar}>
                    <span className={styles.myAnimeCategoryTitle}>Recently Updated</span>
                </div>
                <div className={styles.myAnimeMainCardContainer}>
                    {displayedAnime.map(anime => (
                        <div key={anime.id} className={styles.myAnimeCard}>
                            <div className={styles.myAnimeCardImageContainer}>
                                <img src={imageUrls[anime.id]} alt={anime.title.romaji} className={styles.myAnimeCardImage} />
                            </div>
                            <div className={styles.myAnimeCardTitleContainer}>
                                <span className={styles.myAnimeCardTitle}>
                                    {anime.title.romaji || anime.title.english}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderAnimePopularList = () => {
        return (
            <div className={styles.myAnimePopularContainer}>
                <div className={styles.myAnimeCategoryBar}>
                    <span className={styles.myAnimeCategoryTitle}>Popular</span>
                    <div className={styles.myAnimeCategorySettings}></div>
                </div>
                <div className={styles.myAnimePopularCardContainer}>
                    {popular.map((anime) => (
                        <div key={anime.id} className={styles.myAnimePopularCard}>
                            <div className={styles.myAnimePopularImageContainer}>
                                <img src={imageUrls[anime.id]} alt={anime.title.romaji} className={styles.myAnimePopularImage} />
                            </div>
                            <div className={styles.myAnimeCardTitleContainer}>
                                <span className={styles.myAnimeCardTitle}>
                                    {anime.title.romaji || anime.title.english}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <Base>
            <div className={styles.myAnimeContainer}>
                <div className={`${styles.mySliderContainer1}`}>
                    <div className={`${styles.mySliderContainer2}`}>
                        <Slider {...settings}>
                            {top.map(anime => renderTopCard(anime))}
                        </Slider>
                    </div>
                </div>

                <div className={styles.myAnimeMainContainer}>
                    <div className={styles.myAnimeMainLeft}>
                        {renderAnimeLatestList()}
                        <div className={styles.myAnimeOtherMainContainer}>
                            <div className={styles.myAnimeOtherList}>
                                {renderAnimeList(releases, "New Releases")}
                            </div>
                            <div className={styles.myAnimeOtherList}>
                                {renderAnimeList(added, "Newly Added")}
                            </div>
                            <div className={styles.myAnimeOtherList}>
                                {renderAnimeList(completed, "Completed")}
                            </div>
                        </div>
                    </div>
                    <div className={styles.myAnimeMainRight}>
                        {renderAnimePopularList(popular, "Popular")}
                    </div>
                </div>
            </div>
        </Base>
    );
}
