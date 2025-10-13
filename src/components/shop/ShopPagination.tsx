import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { useSearchParams, Link } from 'react-router-dom';

interface ShopPaginationProps {
  totalCount: number;
  itemsPerPage: number;
}

export function ShopPagination({ totalCount, itemsPerPage }: ShopPaginationProps) {
  const [searchParams] = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const getPageLink = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set('page', page.toString());
    return `/shop?${newSearchParams.toString()}`;
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageButtons = 5; // Max number of page buttons to display

    if (totalPages <= maxPageButtons) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
      let endPage = Math.min(totalPages, currentPage + Math.floor(maxPageButtons / 2));

      if (endPage - startPage + 1 < maxPageButtons) {
        if (startPage === 1) {
          endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
        } else if (endPage === totalPages) {
          startPage = Math.max(1, totalPages - maxPageButtons + 1);
        }
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (startPage > 1) {
        if (startPage > 2) pageNumbers.unshift('...');
        pageNumbers.unshift(1);
      }
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }

    return pageNumbers.map((page, index) =>
      page === '...' ? (
        <span key={`ellipsis-${index}`} className="px-2 py-1 text-brown-600">...</span>
      ) : (
        <Link key={page} to={getPageLink(Number(page))}>
          <Button
            variant={Number(page) === currentPage ? 'primary' : 'outline'}
            size="sm"
          >
            {page}
          </Button>
        </Link>
      )
    );
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center items-center space-x-4 mt-8">
      <Link to={getPageLink(currentPage - 1)}>
        <Button variant="outline" size="sm" disabled={currentPage === 1}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
      </Link>
      <div className="flex space-x-2">
        {renderPageNumbers()}
      </div>
      <Link to={getPageLink(currentPage + 1)}>
        <Button variant="outline" size="sm" disabled={currentPage === totalPages}>
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
}
