import React, { Component } from 'react';
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

export class App extends Component {
  state = {
    searchQuery: '',
    page: 1,
    picsArr: [],
    isLoading: false,
    showModal: false,
    showLoadMoreBtn: false,
    largeImageURL: DefaultPic,
    imageTags: null,
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.searchQuery !== prevState.searchQuery ||
      this.state.page !== prevState.page
    ) {
      this.setState({ isLoading: true });
      this.fetchQuery(this.state.searchQuery, this.state.page);
    }
  }

  onSubmit = FormData => {
    const { query } = FormData;
    this.setState({ searchQuery: query, page: 1, picsArr: [] });
  };

  async fetchQuery(query, page) {
    try {
      await fetchData(query, page).then(result => {
        const { data } = result;
        const { totalHits: total, hits: picsArr } = data;

        const picsLeft = total - 12 * this.state.page;

        if (picsArr.length === 0) {
          this.setState({ showLoadMoreBtn: false });
          Notiflix.Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.',
            notifySettings
          );
          return;
        } else {
          this.setState(prevState => ({
            picsArr: [...prevState.picsArr, ...picsArr],
          }));
        }

        if (picsArr.length > 0 && this.state.page === 1) {
          Notiflix.Notify.success(
            `Hooray! We found ${total} images.`,
            notifySettings
          );
        }

        this.setState({ showLoadMoreBtn: picsLeft > 0 });
      });
    } catch (error) {
      console.log(error);
      Notiflix.Notify.failure(
        'Sorry, something went wrong, please try again later',
        notifySettings
      );
    } finally {
      this.setState({ isLoading: false });
    }
  }

  toggleModal = (largeImageURL, imageTags) => {
    this.setState(prevState => ({
      showModal: !prevState.showModal,
      largeImageURL: largeImageURL,
      imageTags: imageTags,
    }));
  };

  onLoadMoreBtnClick = () => {
    this.setState(prevState => ({
      page: prevState.page + 1,
    }));
  };

  render() {
    return (
      <>
        <Searchbar onSubmit={this.onSubmit} />

        {this.state.picsArr.length === 0 && <StartText />}

        <Container>
          <ImageGallery
            pics={this.state.picsArr}
            showModal={this.toggleModal}
          />

          {this.state.showLoadMoreBtn && (
            <Btn
              text="Load more"
              status="load"
              onClick={this.onLoadMoreBtnClick}
              onLoaderPlay={this.state.isLoading}
            />
          )}
        </Container>
        {this.state.isLoading && <Loader />}

        {this.state.showModal && (
          <Modal
            src={this.state.largeImageURL}
            alt={this.state.imageTags}
            closeModal={this.toggleModal}
          />
        )}
      </>
    );
  }
}
