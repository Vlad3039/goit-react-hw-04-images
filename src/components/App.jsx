import { useState, useEffect } from 'react';
import Notiflix from 'notiflix';

import { fetchData, notifySettings } from './fetch';
import { Container } from './App.styled';
import { StartText } from './StartText/StartText';
import { Searchbar } from './Searchbar/Searchbar';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Loader } from './Loader/Loader';
import { Modal } from './ Modal/Modal';
import { Btn } from './Button/Button';
import DefaultPic from '../images/defaultPic.jpg';

export const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [picsArr, setPicsArr] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showLoadMoreBtn, setShowLoadMoreBtn] = useState(false);
  const [largeImageURL, setLargeImageURL] = useState(DefaultPic);
  const [imageTags, setImageTags] = useState(null);

  useEffect(() => {
    const fetchQuery = async () => {
      try {
        const { data } = await fetchData(searchQuery, page);
        const total = data?.totalHits || 0;
        const picsArr = data?.hits || [];
        if (picsArr.length === 0) {
          setShowLoadMoreBtn(false);
          Notiflix.Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.',
            notifySettings
          );
          return;
        } else {
          setPicsArr(prevPicsArr => [...prevPicsArr, ...picsArr]);
        }
        if (picsArr.length > 0 && page === 1) {
          Notiflix.Notify.success(
            `Hooray! We found ${total} images.`,
            notifySettings
          );
        }
        const picsLeft = total - 12 * page;
        picsLeft > 0 ? setShowLoadMoreBtn(true) : setShowLoadMoreBtn(false);
      } catch (error) {
        console.log(error);
        Notiflix.Notify.failure(
          'Sorry, something went wrong, please try again later',
          notifySettings
        );
      } finally {
        setIsLoading(false);
      }
    };
    if (searchQuery) {
      setIsLoading(true);
      fetchQuery();
    }
  }, [searchQuery, page]);

  const onSubmit = query => {
    setSearchQuery(query);
    setPicsArr([]);
    setPage(1);
  };

  const onLoadMoreBtnClick = () => {
    setPage(prevPage => prevPage + 1);
  };

  const toggleModal = (largeImageURL, imageTags) => {
    setShowModal(!showModal);
    setLargeImageURL(largeImageURL);
    setImageTags(imageTags);
  };

  return (
    <>
      <Searchbar onSubmit={onSubmit} />
      {picsArr.length === 0 && <StartText />}
      <Container>
        <ImageGallery pics={picsArr} showModal={toggleModal} />

        {showLoadMoreBtn && (
          <Btn
            text="Load more"
            status="load"
            onClick={onLoadMoreBtnClick}
            onLoaderPlay={isLoading}
          />
        )}
      </Container>
      {isLoading && <Loader />}

      {showModal && (
        <Modal src={largeImageURL} alt={imageTags} closeModal={toggleModal} />
      )}
    </>
  );
};
