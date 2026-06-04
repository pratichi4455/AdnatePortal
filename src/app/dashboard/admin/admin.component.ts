import { Component, OnInit } from '@angular/core';
import { HeroService } from '../../core/services/hero.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // Tab State
  activeTab: string = 'quick-links'; // 'quick-links' or 'news'

  // Modal State
  isQuickLinkModalOpen: boolean = false;
  isNewsModalOpen: boolean = false;

  // News List Data
  newsList: any[] = [];
  editingNewsId: any = null;

  // Pagination State
  currentPage: number = 1;
  pageSize: number = 5;

  // Quick Links List Data
  quickLinksList: any[] = [];
  editingQuickLinkId: any = null;

  // Quick Links Pagination State
  qlCurrentPage: number = 1;
  qlPageSize: number = 5;

  // Quick Link Form Model
  quickLink = {
    name: '',
    description: '',
    icon: 'inventory_2',
    color: '#4f46e5',
    bgColor: '#e0e7ff',
    access: 'All'
  };

  // News Form Model
  newsItem = {
    title: '',
    description: '',
    date: '',
    type: '',
    icon: 'newspaper',
    bgColor: '#ebedee'
  };

  constructor(private heroService: HeroService) {}

  ngOnInit() {
    this.fetchNewsAnnouncements();
    this.fetchQuickLinks();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  openQuickLinkModal() {
    this.editingQuickLinkId = null;
    this.resetQuickLinkForm();
    this.isQuickLinkModalOpen = true;
  }

  closeQuickLinkModal() {
    this.isQuickLinkModalOpen = false;
  }

  openNewsModal() {
    this.editingNewsId = null;
    this.resetNewsForm();
    this.isNewsModalOpen = true;
  }

  closeNewsModal() {
    this.isNewsModalOpen = false;
  }

  saveQuickLink() {
    console.log('Save Quick Link payload:', this.quickLink);

    const linkAddress = (this.quickLink.name || '').trim();
    const description = (this.quickLink.description || '').trim();

    if (!linkAddress || !description) {
      alert('All fields are mandatory.');
      return;
    }

    const urlRegex = /^(https?:\/\/)?([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:\d+)?(\/.*)?$/i;
    if (!urlRegex.test(linkAddress)) {
      alert('Link Address must be a valid URL.');
      return;
    }

    const alphabetRegex = /^[a-zA-Z\s]+$/;
    if (!alphabetRegex.test(description)) {
      alert('Description must only contain letters and spaces.');
      return;
    }

    this.quickLink.name = linkAddress;
    this.quickLink.description = description;

    let params: any;
    if (this.editingQuickLinkId) {
      params = {
        '@reply': 'yes',
        '@commandUpdate': 'no',
        '@preserveSpace': 'no',
        '@batchUpdate': 'no',
        tuple: {
          old: {
            quick_links_master: {
              '@qConstraint': '0',
              id: this.editingQuickLinkId
            }
          },
          new: {
            quick_links_master: {
              '@qAccess': '0',
              '@qConstraint': '0',
              '@qInit': '0',
              '@qValues': '',
              linkheader: this.quickLink.name,
              linkdescription: this.quickLink.description,
              status: 'Active'
            }
          }
        }
      };
    } else {
      params = {
        '@reply': 'yes',
        '@commandUpdate': 'no',
        '@preserveSpace': 'no',
        '@batchUpdate': 'no',
        tuple: {
          new: {
            quick_links_master: {
              '@qAccess': '0',
              '@qConstraint': '0',
              '@qInit': '0',
              '@qValues': '',
              linkheader: this.quickLink.name,
              linkdescription: this.quickLink.description,
              status: 'Active'
            }
          }
        }
      };
    }

    this.heroService.ajax(
      'UpdateQuick_links_master',
      'http://schemas.cordys.com/AW_Database_Metadata',
      params
    ).then((resp: any) => {
      console.log('Save quick link success response:', resp);
      alert(this.editingQuickLinkId ? 'Quick Link updated successfully!' : 'Quick Link saved successfully!');
      this.resetQuickLinkForm();
      this.closeQuickLinkModal();
      this.fetchQuickLinks();
    }).catch((err: any) => {
      console.error('Save quick link error response:', err);
      alert('Failed to save Quick Link. Check console for details.');
    });
  }

  fetchQuickLinks() {
    this.heroService.ajax(
      'GetAllQuickLinks',
      'http://schemas.cordys.com/AW_Database_Metadata',
      {
        preserveSpace: 'no',
        qAccess: '0',
        qValues: ''
      }
    ).then((resp: any) => {
      const result = this.heroService.xmltojson(resp, 'quick_links_master');
      let list = [];
      if (!result) {
        list = [];
      } else if (Array.isArray(result)) {
        list = result;
      } else {
        list = [result];
      }
      this.quickLinksList = list.filter((item: any) => item.status !== 'Inactive');
      this.qlCurrentPage = 1; // Reset to page 1
      console.log('Fetched quick links:', this.quickLinksList);
    }).catch((err: any) => {
      console.error('Error fetching quick links:', err);
    });
  }

  deleteQuickLink(item: any) {
    if (!confirm('Are you sure you want to delete this quick link?')) {
      return;
    }

    const params = {
      '@reply': 'yes',
      '@commandUpdate': 'no',
      '@preserveSpace': 'no',
      '@batchUpdate': 'no',
      tuple: {
        old: {
          quick_links_master: {
            '@qConstraint': '0',
            id: item.id
          }
        },
        new: {
          quick_links_master: {
            '@qAccess': '0',
            '@qConstraint': '0',
            '@qInit': '0',
            '@qValues': '',
            status: 'Inactive'
          }
        }
      }
    };

    this.heroService.ajax(
      'UpdateQuick_links_master',
      'http://schemas.cordys.com/AW_Database_Metadata',
      params
    ).then((resp: any) => {
      console.log('Delete quick link success response:', resp);
      alert('Quick Link deleted successfully!');
      this.fetchQuickLinks();
    }).catch((err: any) => {
      console.error('Delete quick link error response:', err);
      alert('Failed to delete quick link. Check console for details.');
    });
  }

  editQuickLink(item: any) {
    this.editingQuickLinkId = item.id;
    this.quickLink = {
      name: item.linkheader || '',
      description: item.linkdescription || '',
      icon: 'inventory_2',
      color: '#4f46e5',
      bgColor: '#e0e7ff',
      access: 'All'
    };
    this.isQuickLinkModalOpen = true;
  }

  fetchNewsAnnouncements() {
    this.heroService.ajax(
      'GetAllNewsAnnouncements',
      'http://schemas.cordys.com/AW_Database_Metadata',
      {
        preserveSpace: 'no',
        qAccess: '0',
        qValues: ''
      }
    ).then((resp: any) => {
      const result = this.heroService.xmltojson(resp, 'news_announcements');
      let list = [];
      if (!result) {
        list = [];
      } else if (Array.isArray(result)) {
        list = result;
      } else {
        list = [result];
      }
      this.newsList = list.filter((item: any) => item.status !== 'Inactive');
      this.currentPage = 1; // Reset to page 1
      console.log('Fetched news announcements:', this.newsList);
    }).catch((err: any) => {
      console.error('Error fetching news announcements:', err);
    });
  }

  editNewsItem(item: any) {
    this.editingNewsId = item.id;
    let formattedDate = '';
    if (item.created_date) {
      formattedDate = item.created_date.substring(0, 10);
    }
    let formattedType = '';
    if (item.type) {
      const typeLower = item.type.toLowerCase();
      if (typeLower === 'internal') {
        formattedType = 'Internal';
      } else if (typeLower === 'external') {
        formattedType = 'External';
      }
    }
    this.newsItem = {
      title: item.heading || '',
      description: item.description || '',
      date: formattedDate,
      type: formattedType,
      icon: 'newspaper',
      bgColor: '#ebedee'
    };
    this.isNewsModalOpen = true;
  }

  deleteNewsItem(item: any) {
    if (!confirm('Are you sure you want to delete this news item?')) {
      return;
    }

    const params = {
      '@reply': 'yes',
      '@commandUpdate': 'no',
      '@preserveSpace': 'no',
      '@batchUpdate': 'no',
      tuple: {
        old: {
          news_announcements: {
            '@qConstraint': '0',
            id: item.id
          }
        },
        new: {
          news_announcements: {
            '@qAccess': '0',
            '@qConstraint': '0',
            '@qInit': '0',
            '@qValues': '',
            status: 'Inactive'
          }
        }
      }
    };

    this.heroService.ajax(
      'UpdateNews_announcements',
      'http://schemas.cordys.com/AW_Database_Metadata',
      params
    ).then((resp: any) => {
      console.log('Delete news success response:', resp);
      alert('News item deleted successfully!');
      this.fetchNewsAnnouncements();
    }).catch((err: any) => {
      console.error('Delete news error response:', err);
      alert('Failed to delete news item. Check console for details.');
    });
  }

  saveNewsItem() {
    console.log('Save News Item payload:', this.newsItem);

    const title = (this.newsItem.title || '').trim();
    const description = (this.newsItem.description || '').trim();
    const date = (this.newsItem.date || '').trim();
    const type = (this.newsItem.type || '').trim();

    if (!title || !description || !date || !type) {
      alert('All fields are mandatory.');
      return;
    }

    const alphabetRegex = /^[a-zA-Z\s]+$/;
    if (!alphabetRegex.test(title)) {
      alert('Title must only contain letters and spaces.');
      return;
    }
    if (!alphabetRegex.test(description)) {
      alert('Description must only contain letters and spaces.');
      return;
    }

    // Update with trimmed values
    this.newsItem.title = title;
    this.newsItem.description = description;
    this.newsItem.date = date;
    this.newsItem.type = type;

    let params: any;
    if (this.editingNewsId) {
      params = {
        '@reply': 'yes',
        '@commandUpdate': 'no',
        '@preserveSpace': 'no',
        '@batchUpdate': 'no',
        tuple: {
          old: {
            news_announcements: {
              '@qConstraint': '0',
              id: this.editingNewsId
            }
          },
          new: {
            news_announcements: {
              '@qAccess': '0',
              '@qConstraint': '0',
              '@qInit': '0',
              '@qValues': '',
              heading: this.newsItem.title,
              description: this.newsItem.description,
              created_date: this.newsItem.date ? (this.newsItem.date.includes('T') ? this.newsItem.date : this.newsItem.date + 'T00:00:00.0') : '',
              type: this.newsItem.type
            }
          }
        }
      };
    } else {
      params = {
        tuple: {
          new: {
            news_announcements: {
              heading: this.newsItem.title,
              description: this.newsItem.description,
              created_date: this.newsItem.date,
              type: this.newsItem.type,
              status: 'Active'
            }
          }
        }
      };
    }

    this.heroService.ajax(
      'UpdateNews_announcements',
      'http://schemas.cordys.com/AW_Database_Metadata',
      params
    ).then((resp: any) => {
      console.log('Publish news success response:', resp);
      alert(this.editingNewsId ? 'News updated successfully!' : 'News published successfully!');
      this.resetNewsForm();
      this.closeNewsModal();
      this.fetchNewsAnnouncements();
    }).catch((err: any) => {
      console.error('Publish news error response:', err);
      alert('Failed to save news item. Check console for details.');
    });
  }

  resetNewsForm() {
    this.newsItem = {
      title: '',
      description: '',
      date: '',
      type: '',
      icon: 'newspaper',
      bgColor: '#ebedee'
    };
  }

  resetQuickLinkForm() {
    this.quickLink = {
      name: '',
      description: '',
      icon: 'inventory_2',
      color: '#4f46e5',
      bgColor: '#e0e7ff',
      access: 'All'
    };
  }

  formatDate(dateStr: string) {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  // Pagination getters & methods
  get totalPages(): number {
    return Math.ceil(this.newsList.length / this.pageSize) || 1;
  }

  get paginatedNewsList(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.newsList.slice(startIndex, startIndex + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get showingTo(): number {
    const to = this.currentPage * this.pageSize;
    return to > this.newsList.length ? this.newsList.length : to;
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Quick Links Pagination getters & methods
  get qlTotalPages(): number {
    return Math.ceil(this.quickLinksList.length / this.qlPageSize) || 1;
  }

  get paginatedQuickLinksList(): any[] {
    const startIndex = (this.qlCurrentPage - 1) * this.qlPageSize;
    return this.quickLinksList.slice(startIndex, startIndex + this.qlPageSize);
  }

  get qlPageNumbers(): number[] {
    const pages = [];
    for (let i = 1; i <= this.qlTotalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  get qlShowingTo(): number {
    const to = this.qlCurrentPage * this.qlPageSize;
    return to > this.quickLinksList.length ? this.quickLinksList.length : to;
  }

  qlSetPage(page: number) {
    if (page >= 1 && page <= this.qlTotalPages) {
      this.qlCurrentPage = page;
    }
  }

  qlPrevPage() {
    if (this.qlCurrentPage > 1) {
      this.qlCurrentPage--;
    }
  }

  qlNextPage() {
    if (this.qlCurrentPage < this.qlTotalPages) {
      this.qlCurrentPage++;
    }
  }
}
