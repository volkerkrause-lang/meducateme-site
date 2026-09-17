(() => {
  // IDs are permanent: keep them unchanged if a lesson title, URL or section changes.
  // Access is metadata only for now; it does not lock or hide any content.
  const lessons = [
    {
      id: 'case-dka',
      section: 'cases',
      title: 'Vomiting + deep breathing',
      listingTitles: ['Vomiting + deep breathing'],
      href: 'lesson.html?topic=dka',
      paths: ['lesson.html'],
      access: 'free'
    },
    {
      id: 'case-hyponatraemia-pneumonia',
      section: 'cases',
      title: 'Hyponatraemia in pneumonia',
      listingTitles: ['Hyponatremia', 'Hyponatraemia'],
      href: 'case-hyponatremia.html',
      paths: ['case-hyponatremia.html'],
      access: 'free'
    },
    {
      id: 'concept-hyponatraemia',
      section: 'concepts',
      title: 'Hyponatraemia',
      listingTitles: ['Hyponatraemia'],
      href: 'concept-hyponatraemia.html',
      paths: ['concept-hyponatraemia.html'],
      access: 'free'
    },
    {
      id: 'concept-diabetes-mellitus',
      section: 'concepts',
      title: 'Diabetes mellitus',
      listingTitles: ['Diabetes mellitus'],
      href: 'concept-diabetes.html',
      paths: ['concept-diabetes.html'],
      access: 'free'
    },
    {
      id: 'concept-paediatric-tracheostomy',
      section: 'concepts',
      title: 'Paediatric tracheostomy',
      listingTitles: ['Paediatric tracheostomy'],
      href: 'concept-tracheostomy.html',
      paths: ['concept-tracheostomy.html'],
      access: 'preview'
    },
    {
      id: 'fundamental-cortisol-physiology',
      section: 'fundamentals',
      title: 'Cortisol & the adrenal gland',
      listingTitles: ['Cortisol physiology', 'Cortisol & the adrenal gland'],
      href: 'fundamental-cortisol-guided.html',
      paths: [
        'fundamental-cortisol.html',
        'fundamental-cortisol-guided.html',
        'fundamental-cortisol-session.html'
      ],
      access: 'free'
    }
  ];

  const accessLevels = Object.freeze(['free', 'preview', 'premium']);
  lessons.forEach(lesson => {
    if (!accessLevels.includes(lesson.access)) {
      throw new Error(`Invalid lesson access level: ${lesson.access}`);
    }
    Object.freeze(lesson.listingTitles);
    Object.freeze(lesson.paths);
    Object.freeze(lesson);
  });

  const byId = id => lessons.find(lesson => lesson.id === id) || null;
  const byListing = (section, title) => lessons.find(lesson =>
    lesson.section === section && lesson.listingTitles.includes(title)
  ) || null;
  const byHref = href => {
    if (!href) return null;
    const url = new URL(href, window.location.href);
    const path = url.pathname.split('/').pop() || 'index.html';
    return lessons.find(lesson => lesson.paths.includes(path)) || null;
  };

  window.MeducateMeLessons = Object.freeze({
    accessLevels,
    all: Object.freeze(lessons),
    byId,
    byListing,
    byHref
  });

  const current = byHref(window.location.href);
  if (current) {
    document.documentElement.dataset.lessonId = current.id;
    document.documentElement.dataset.lessonAccess = current.access;
  }
})();
