// // src/components/TealPagination.jsx
// import * as React from 'react';
// import { Box } from '@mui/material';
// import { useGridApiContext, useGridSelector, gridPageSelector, gridPageCountSelector } from '@mui/x-data-grid';
// import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
// import ChevronRightIcon from '@mui/icons-material/ChevronRight';

// const makeRange = (start, end) =>
//   Array.from({ length: end - start + 1 }, (_, i) => start + i);

// // Common small button inside pagination pill
// const PageBtn = ({ label = '', active, disabled, onClick, children }) => (
//   <Box
//     component="button"
//     onClick={disabled ? undefined : onClick}
//     disabled={disabled}
//     sx={{
//       border: 'none',
//       outline: 'none',
//       cursor: disabled ? 'not-allowed' : 'pointer',
//       backgroundColor: active ? '#666' : 'transparent',
//       color: '#fff',
//       fontSize: 13,
//       fontWeight: 500,
//       borderRadius: '50%',
//       px: 1.2,
//       py: 0.5,
//       opacity: disabled ? 0.35 : 1,
//       '&:hover': !disabled
//         ? {
//             backgroundColor: label === 'prev' || label === 'next' ? 'transparent' : '#444', // teal hover
//             color: '#fff'
//           }
//         : {},
//       transition: 'all 130ms ease-out'
//     }}
//   >
//     {children}
//   </Box>
// );

// export default function TablePagination() {
//   const apiRef = useGridApiContext();
//   const page = useGridSelector(apiRef, gridPageSelector); // 0-based
//   const pageCount = useGridSelector(apiRef, gridPageCountSelector);

//   if (!pageCount || pageCount <= 1) return null;

//   const goToPage = (p) => apiRef.current.setPage(p);
//   const handlePrev = () => page > 0 && goToPage(page - 1);
//   const handleNext = () => page < pageCount - 1 && goToPage(page + 1);

//   let pages = [];
//   if (pageCount && pageCount > 0) {
//     if (pageCount <= 6) {
//       pages = makeRange(0, pageCount - 1);
//     } else {
//       const start = Math.max(0, page - 2);
//       const end = Math.min(pageCount - 1, page + 2);
//       pages = makeRange(start, end);
//     }
//   }

//   return (
//     <Box
//       // 🔥 fixed at bottom center of viewport
//       sx={{
//         position: 'fixed',
//         bottom: 12,
//         left: '50%',
//         transform: 'translateX(-50%)',
//         zIndex: 1300,
//         pointerEvents: 'none' // so table rows still clickable under it
//       }}
//     >
//       <Box
//         sx={{
//           pointerEvents: 'auto',
//           display: 'inline-flex',
//           alignItems: 'center',
//           gap: 1.2,
//           px: 2.8,
//           py: 0.9,
//           borderRadius: 999,
//           // glassy dark pill
//           background: '#222',
//           border: '1px solid #ffffff4f', // teal border
//           boxShadow: '0 18px 45px rgba(0,0,0,0.85)',
//           backdropFilter: 'blur(14px)'
//         }}
//       >
//         {/* Prev */}
//         <PageBtn label={'prev'} disabled={page === 0} onClick={handlePrev}>
//           <ChevronLeftIcon sx={{ fontSize: 18, mr: 0.4 }} />
//           <span>Prev</span>
//         </PageBtn>

//         {/* Page numbers */}
//         {pages.map((p) => (
//           <PageBtn key={p} active={p === page} onClick={() => goToPage(p)}>
//             {p + 1}
//           </PageBtn>
//         ))}

//         {/* Next */}
//         <PageBtn label={'prev'} disabled={page === pageCount - 1} onClick={handleNext}>
//           <span>Next</span>
//           <ChevronRightIcon sx={{ fontSize: 18, ml: 0.4 }} />
//         </PageBtn>
//       </Box>
//     </Box>
//   );
// }


// src/components/TablePagination.jsx
import * as React from "react";
import { Box } from "@mui/material";
import {
  useGridApiContext,
  useGridSelector,
  gridPageSelector,
  gridPageCountSelector,
} from "@mui/x-data-grid";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const makeRange = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

const PageBtn = ({ label = '', active, disabled, onClick, children }) => (
  <Box
    component="button"
    onClick={disabled ? undefined : onClick}
    disabled={disabled}
    sx={{
      border: 'none',
      outline: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      backgroundColor: active ? '#666' : 'transparent',
      color: '#fff',
      fontSize: 13,
      fontWeight: 500,
      borderRadius: '50%',
      px: 1.2,
      py: 0.5,
      opacity: disabled ? 0.35 : 1,
      '&:hover': !disabled
        ? {
            backgroundColor: label === 'prev' || label === 'next' ? 'transparent' : '#444', // teal hover
            color: '#fff'
          }
        : {},
      transition: 'all 130ms ease-out'
    }}
  >
    {children}
  </Box>
);

export default function TablePagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector); // 0-based
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  // ❌ pehle yahan <=1 pe return kar rahe thay
  // if (!pageCount || pageCount <= 1) return null;
  // ✅ ab hum hamesha show karenge (even 1 page). Agar kabhi 0 ho,
  // to pages array khali rahega aur Prev/Next disabled honge.

  const goToPage = (p) => apiRef.current.setPage(p);
  const handlePrev = () => page > 0 && goToPage(page - 1);
  const handleNext = () => page < pageCount - 1 && goToPage(page + 1);

  let pages = [];
  if (pageCount && pageCount > 0) {
    if (pageCount <= 6) {
      pages = makeRange(0, pageCount - 1);
    } else {
      const start = Math.max(0, page - 2);
      const end = Math.min(pageCount - 1, page + 2);
      pages = makeRange(start, end);
    }
  }

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1300,
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          pointerEvents: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 1.2,
          px: 2.8,
          py: 0.9,
          borderRadius: 999,
          background: "#18181b",
          border: "1px solid #ffffff4f", // teal-ish border
          boxShadow: "0 18px 45px rgba(0,0,0,0.85)",
          backdropFilter: "blur(14px)",
        }}
      >
        {/* Prev */}
        <PageBtn label="prev" disabled={page === 0} onClick={handlePrev}>
          <ChevronLeftIcon sx={{ fontSize: 18 }} />
          <span>Prev</span>
        </PageBtn>

        {/* Page numbers */}
        {pages.map((p) => (
          <PageBtn key={p} active={p === page} onClick={() => goToPage(p)}>
            {p + 1}
          </PageBtn>
        ))}

        {/* Next */}
        <PageBtn
          label="next"
          disabled={pageCount === 0 || page === pageCount - 1}
          onClick={handleNext}
        >
          <span>Next</span>
          <ChevronRightIcon sx={{ fontSize: 18 }} />
        </PageBtn>
      </Box>
    </Box>
  );
}
