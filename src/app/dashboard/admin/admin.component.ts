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
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  openQuickLinkModal() {
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
    // API call will be placed here
    alert('Quick Link payload saved (Check Console)');
    this.closeQuickLinkModal();
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
      if (!result) {
        this.newsList = [];
      } else if (Array.isArray(result)) {
        this.newsList = result;
      } else {
        this.newsList = [result];
      }
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
    this.newsItem = {
      title: item.heading || '',
      description: item.description || '',
      date: formattedDate,
      type: item.type || '',
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
      tuple: {
        old: {
          news_announcements: {
            id: item.id
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
              type: this.newsItem.type
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
}
